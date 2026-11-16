import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, wallpapers, type WallpaperRow } from "@/db/schema";
import { ImageValidationError, processImage } from "@/lib/images";
import { removeMedia, saveMedia } from "@/lib/storage";
import { computeAspectRatio, computeResolution, createWallpaperId } from "@/lib/utils";

export class WallpaperServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export { ImageValidationError };

export interface NewWallpaperInput {
  buffer: Buffer;
  title: string;
  description?: string;
  categoryId: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  isDemo?: boolean;
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const rows = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (rows.length === 0) throw new WallpaperServiceError("The selected category does not exist.", 400);
}

/** Validates + stores the original (untouched), writes derived thumbnail/preview, then inserts the record. */
export async function createWallpaper(input: NewWallpaperInput): Promise<WallpaperRow> {
  await assertCategoryExists(input.categoryId);
  const image = await processImage(input.buffer);
  const id = createWallpaperId(input.title);
  const originalFile = `${id}.${image.extension}`;
  const thumbnailFile = `${id}.webp`;
  const previewFile = `${id}.webp`;

  await Promise.all([
    saveMedia("original", originalFile, input.buffer),
    saveMedia("thumbnails", thumbnailFile, image.thumbnail),
    saveMedia("previews", previewFile, image.preview),
  ]);

  try {
    const [row] = await db
      .insert(wallpapers)
      .values({
        id,
        title: input.title,
        description: input.description ?? "",
        categoryId: input.categoryId,
        tags: input.tags ?? [],
        originalFile,
        thumbnailFile,
        previewFile,
        width: image.width,
        height: image.height,
        resolution: computeResolution(image.width, image.height),
        aspectRatio: computeAspectRatio(image.width, image.height),
        format: image.format,
        fileSize: image.fileSize,
        color: image.color,
        featured: input.featured ?? false,
        published: input.published ?? true,
        isDemo: input.isDemo ?? false,
      })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return row;
  } catch (error) {
    // Do not leave orphaned files behind if the database insert fails.
    await Promise.allSettled([
      removeMedia("original", originalFile),
      removeMedia("thumbnails", thumbnailFile),
      removeMedia("previews", previewFile),
    ]);
    throw error;
  }
}

/**
 * Replaces the image of an existing wallpaper. The id (and therefore URL), title, category, tags,
 * description, featured state and download statistics are all preserved.
 */
export async function replaceWallpaperImage(id: string, buffer: Buffer): Promise<WallpaperRow> {
  const [existing] = await db.select().from(wallpapers).where(eq(wallpapers.id, id)).limit(1);
  if (!existing) throw new WallpaperServiceError("Wallpaper not found.", 404);

  const image = await processImage(buffer);
  const originalFile = `${id}.${image.extension}`;
  await Promise.all([
    saveMedia("original", originalFile, buffer),
    saveMedia("thumbnails", existing.thumbnailFile, image.thumbnail),
    saveMedia("previews", existing.previewFile, image.preview),
  ]);

  const [row] = await db
    .update(wallpapers)
    .set({
      originalFile,
      width: image.width,
      height: image.height,
      resolution: computeResolution(image.width, image.height),
      aspectRatio: computeAspectRatio(image.width, image.height),
      format: image.format,
      fileSize: image.fileSize,
      color: image.color,
      isDemo: false,
      imageVersion: sql`${wallpapers.imageVersion} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(wallpapers.id, id))
    .returning();
  if (!row) throw new WallpaperServiceError("Wallpaper not found.", 404);

  if (existing.originalFile !== originalFile) await removeMedia("original", existing.originalFile);
  return row;
}

export interface WallpaperPatch {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

export async function updateWallpaper(id: string, patch: WallpaperPatch): Promise<WallpaperRow> {
  if (patch.categoryId) await assertCategoryExists(patch.categoryId);
  const existing = await db.select({ published: wallpapers.published }).from(wallpapers).where(eq(wallpapers.id, id)).limit(1);
  if (!existing[0]) throw new WallpaperServiceError("Wallpaper not found.", 404);

  const [row] = await db
    .update(wallpapers)
    .set({
      ...patch,
      // Publication date is (re)set the moment a draft goes live so "Newest" stays meaningful.
      ...(patch.published === true && existing[0].published === false ? { publishedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(wallpapers.id, id))
    .returning();
  if (!row) throw new WallpaperServiceError("Wallpaper not found.", 404);
  return row;
}

async function removeFiles(rows: Array<Pick<WallpaperRow, "originalFile" | "thumbnailFile" | "previewFile">>): Promise<void> {
  await Promise.allSettled(
    rows.flatMap((row) => [
      removeMedia("original", row.originalFile),
      removeMedia("thumbnails", row.thumbnailFile),
      removeMedia("previews", row.previewFile),
    ]),
  );
}

/** Deletes database records (download history cascades) and every file belonging to them. */
export async function deleteWallpapers(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const removed = await db.delete(wallpapers).where(inArray(wallpapers.id, ids)).returning();
  await removeFiles(removed);
  return removed.length;
}

export async function deleteDemoWallpapers(): Promise<number> {
  const removed = await db.delete(wallpapers).where(eq(wallpapers.isDemo, true)).returning();
  await removeFiles(removed);
  return removed.length;
}

export async function bulkUpdate(
  ids: string[],
  patch: { featured?: boolean; published?: boolean; categoryId?: string },
): Promise<number> {
  if (ids.length === 0) return 0;
  if (patch.categoryId) await assertCategoryExists(patch.categoryId);
  const updated = await db
    .update(wallpapers)
    .set({
      ...patch,
      ...(patch.published === true
        ? { publishedAt: sql`case when ${wallpapers.published} = false then now() else ${wallpapers.publishedAt} end` }
        : {}),
      updatedAt: new Date(),
    })
    .where(inArray(wallpapers.id, ids))
    .returning({ id: wallpapers.id });
  return updated.length;
}
