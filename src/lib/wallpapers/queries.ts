import { cache } from "react";
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, contactMessages, downloadEvents, wallpapers } from "@/db/schema";
import { ensureBootstrapped } from "@/lib/wallpapers/bootstrap";
import {
  mediaUrl,
  type CategorySummary,
  type SortKey,
  type WallpaperDetail,
  type WallpaperSummary,
} from "@/lib/wallpapers/types";
import { escapeLike, qualityLabel } from "@/lib/utils";

const summaryColumns = {
  id: wallpapers.id,
  title: wallpapers.title,
  categoryId: wallpapers.categoryId,
  categoryName: categories.name,
  width: wallpapers.width,
  height: wallpapers.height,
  resolution: wallpapers.resolution,
  aspectRatio: wallpapers.aspectRatio,
  format: wallpapers.format,
  color: wallpapers.color,
  thumbnailFile: wallpapers.thumbnailFile,
  imageVersion: wallpapers.imageVersion,
  featured: wallpapers.featured,
  published: wallpapers.published,
  isDemo: wallpapers.isDemo,
  downloads: wallpapers.downloads,
  publishedAt: wallpapers.publishedAt,
};

type SummaryRow = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  width: number;
  height: number;
  resolution: string;
  aspectRatio: string;
  format: string;
  color: string;
  thumbnailFile: string;
  imageVersion: number;
  featured: boolean;
  published: boolean;
  isDemo: boolean;
  downloads: number;
  publishedAt: Date;
};

function toSummary(row: SummaryRow): WallpaperSummary {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    width: row.width,
    height: row.height,
    resolution: row.resolution,
    aspectRatio: row.aspectRatio,
    format: row.format,
    quality: qualityLabel(row.width, row.height),
    color: row.color,
    thumbnailUrl: mediaUrl("thumbnails", row.thumbnailFile, row.imageVersion),
    featured: row.featured,
    published: row.published,
    isDemo: row.isDemo,
    downloads: row.downloads,
    publishedAt: row.publishedAt.toISOString(),
  };
}

export interface WallpaperQuery {
  q?: string;
  categoryId?: string;
  featured?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  ids?: string[];
  excludeId?: string;
  /** "all" is for the admin dashboard; public pages always use "published". */
  status?: "published" | "draft" | "all";
  demoOnly?: boolean;
}

const trendingScore = sql`(select count(*) from ${downloadEvents} where ${downloadEvents.wallpaperId} = ${wallpapers.id} and ${downloadEvents.createdAt} > now() - interval '7 days')`;

function buildWhere(query: WallpaperQuery): SQL | undefined {
  const status = query.status ?? "published";
  const conditions: Array<SQL | undefined> = [];
  if (status === "published") conditions.push(eq(wallpapers.published, true));
  if (status === "draft") conditions.push(eq(wallpapers.published, false));
  if (query.categoryId) conditions.push(eq(wallpapers.categoryId, query.categoryId));
  if (query.featured) conditions.push(eq(wallpapers.featured, true));
  if (query.demoOnly) conditions.push(eq(wallpapers.isDemo, true));
  if (query.ids) conditions.push(inArray(wallpapers.id, query.ids.length ? query.ids : ["__none__"]));
  if (query.excludeId) conditions.push(sql`${wallpapers.id} <> ${query.excludeId}`);

  const terms = (query.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 6);
  for (const term of terms) {
    const pattern = `%${escapeLike(term)}%`;
    conditions.push(
      or(
        ilike(wallpapers.title, pattern),
        ilike(wallpapers.description, pattern),
        ilike(categories.name, pattern),
        sql`array_to_string(${wallpapers.tags}, ' ') ilike ${pattern}`,
      ),
    );
  }
  return and(...conditions);
}

function buildOrder(sort: SortKey | undefined): SQL[] {
  switch (sort) {
    case "popular":
      return [desc(wallpapers.downloads), desc(wallpapers.publishedAt)];
    case "trending":
      return [desc(trendingScore), desc(wallpapers.downloads), desc(wallpapers.publishedAt)];
    case "featured":
      return [desc(wallpapers.featured), desc(wallpapers.publishedAt)];
    default:
      return [desc(wallpapers.publishedAt), desc(wallpapers.createdAt)];
  }
}

export async function queryWallpapers(query: WallpaperQuery): Promise<{ items: WallpaperSummary[]; total: number }> {
  await ensureBootstrapped();
  const pageSize = Math.min(Math.max(query.pageSize ?? 24, 1), 100);
  const page = Math.max(query.page ?? 1, 1);
  const where = buildWhere(query);

  const [rows, countRows] = await Promise.all([
    db
      .select(summaryColumns)
      .from(wallpapers)
      .innerJoin(categories, eq(categories.id, wallpapers.categoryId))
      .where(where)
      .orderBy(...buildOrder(query.sort))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(wallpapers)
      .innerJoin(categories, eq(categories.id, wallpapers.categoryId))
      .where(where),
  ]);
  return { items: rows.map(toSummary), total: countRows[0]?.total ?? 0 };
}

export async function listWallpapers(query: WallpaperQuery & { limit: number }): Promise<WallpaperSummary[]> {
  const { items } = await queryWallpapers({ ...query, pageSize: query.limit, page: 1 });
  return items;
}

export const getWallpaperDetail = cache(async (id: string, includeDrafts = false): Promise<WallpaperDetail | null> => {
  await ensureBootstrapped();
  const rows = await db
    .select({
      ...summaryColumns,
      description: wallpapers.description,
      tags: wallpapers.tags,
      previewFile: wallpapers.previewFile,
      originalFile: wallpapers.originalFile,
      fileSize: wallpapers.fileSize,
      updatedAt: wallpapers.updatedAt,
      createdAt: wallpapers.createdAt,
    })
    .from(wallpapers)
    .innerJoin(categories, eq(categories.id, wallpapers.categoryId))
    .where(eq(wallpapers.id, id))
    .limit(1);
  const row = rows[0];
  if (!row || (!row.published && !includeDrafts)) return null;
  return {
    ...toSummary(row),
    description: row.description,
    tags: row.tags,
    previewUrl: mediaUrl("previews", row.previewFile, row.imageVersion),
    originalUrl: mediaUrl("original", row.originalFile, row.imageVersion),
    downloadUrl: `/api/download/${row.id}`,
    fileSize: row.fileSize,
    originalFile: row.originalFile,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
});

/** Same category first, then wallpapers that share tags. */
export async function getRelatedWallpapers(detail: WallpaperDetail, limit = 8): Promise<WallpaperSummary[]> {
  const sameCategory = await listWallpapers({ categoryId: detail.categoryId, excludeId: detail.id, sort: "popular", limit });
  if (sameCategory.length >= limit || detail.tags.length === 0) return sameCategory;
  const tagMatches = await db
    .select(summaryColumns)
    .from(wallpapers)
    .innerJoin(categories, eq(categories.id, wallpapers.categoryId))
    .where(
      and(
        eq(wallpapers.published, true),
        sql`${wallpapers.id} <> ${detail.id}`,
        sql`${wallpapers.tags} && ARRAY[${sql.join(detail.tags.map((tag) => sql`${tag}`), sql`, `)}]::text[]`,
      ),
    )
    .orderBy(desc(wallpapers.downloads))
    .limit(limit);
  const seen = new Set(sameCategory.map((item) => item.id));
  const merged = [...sameCategory];
  for (const row of tagMatches) {
    if (!seen.has(row.id) && merged.length < limit) merged.push(toSummary(row));
  }
  return merged;
}

export async function listCategories(options: { includeEmpty?: boolean } = {}): Promise<CategorySummary[]> {
  await ensureBootstrapped();
  const [rows, counts, covers] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({ categoryId: wallpapers.categoryId, count: sql<number>`count(*)::int` })
      .from(wallpapers)
      .where(eq(wallpapers.published, true))
      .groupBy(wallpapers.categoryId),
    db.execute<{ category_id: string; thumbnail_file: string; image_version: number; color: string }>(
      sql`select distinct on (category_id) category_id, thumbnail_file, image_version, color
          from wallpapers where published = true
          order by category_id, featured desc, published_at desc`,
    ),
  ]);
  const countMap = new Map(counts.map((entry) => [entry.categoryId, entry.count]));
  const coverMap = new Map(covers.rows.map((entry) => [entry.category_id, entry]));
  return rows
    .map((row) => {
      const cover = coverMap.get(row.id);
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        sortOrder: row.sortOrder,
        count: countMap.get(row.id) ?? 0,
        coverUrl: cover ? mediaUrl("thumbnails", cover.thumbnail_file, cover.image_version) : null,
        coverColor: cover?.color ?? null,
      };
    })
    .filter((category) => options.includeEmpty || category.count > 0);
}

export async function getCategory(id: string): Promise<{ id: string; name: string; description: string } | null> {
  await ensureBootstrapped();
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSiteStats(): Promise<{ wallpapers: number; categories: number; downloads: number }> {
  await ensureBootstrapped();
  const [row] = await db
    .select({
      wallpapers: sql<number>`count(*)::int`,
      downloads: sql<number>`coalesce(sum(${wallpapers.downloads}), 0)::int`,
    })
    .from(wallpapers)
    .where(eq(wallpapers.published, true));
  const categoryList = await listCategories();
  return { wallpapers: row?.wallpapers ?? 0, downloads: row?.downloads ?? 0, categories: categoryList.length };
}

export async function listAllPublishedIds(): Promise<Array<{ id: string; updatedAt: Date; categoryId: string }>> {
  await ensureBootstrapped();
  return db
    .select({ id: wallpapers.id, updatedAt: wallpapers.updatedAt, categoryId: wallpapers.categoryId })
    .from(wallpapers)
    .where(eq(wallpapers.published, true))
    .orderBy(desc(wallpapers.publishedAt))
    .limit(5000);
}

/* ------------------------------ admin statistics ------------------------------ */

export async function getAdminDashboardStats() {
  await ensureBootstrapped();
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${wallpapers.published})::int`,
      featured: sql<number>`count(*) filter (where ${wallpapers.featured})::int`,
      demo: sql<number>`count(*) filter (where ${wallpapers.isDemo})::int`,
      downloads: sql<number>`coalesce(sum(${wallpapers.downloads}), 0)::int`,
    })
    .from(wallpapers);
  const [unread] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));
  const daily = await db.execute<{ day: string; count: number }>(
    sql`select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(c.count, 0)::int as count
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') as d(day)
        left join (select date_trunc('day', created_at)::date as day, count(*) as count
                   from download_events group by 1) c on c.day = d.day::date
        order by d.day`,
  );
  const top = await listWallpapers({ status: "all", sort: "popular", limit: 5 });
  return {
    totals: totals ?? { total: 0, published: 0, featured: 0, demo: 0, downloads: 0 },
    unreadMessages: unread?.count ?? 0,
    daily: daily.rows,
    top,
  };
}
