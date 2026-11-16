import type { Metadata } from "next";
import Link from "next/link";
import { WallpaperManager } from "@/components/admin/WallpaperManager";
import { buildHref, Pagination } from "@/components/ui/common";
import { readParam } from "@/components/explore/ExploreView";
import { requireAdminPage } from "@/lib/auth";
import { listCategories, queryWallpapers } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallpapers" };

const PAGE_SIZE = 30;
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminWallpapersPage({ searchParams }: Props) {
  await requireAdminPage();
  const params = await searchParams;
  const q = (readParam(params.q) ?? "").trim().slice(0, 80);
  const category = readParam(params.category) ?? "";
  const statusParam = readParam(params.status);
  const status = statusParam === "published" || statusParam === "draft" ? statusParam : "all";
  const page = Math.max(1, Number.parseInt(readParam(params.page) ?? "1", 10) || 1);

  const categories = await listCategories({ includeEmpty: true });
  const { items, total } = await queryWallpapers({
    q,
    categoryId: category || undefined,
    status,
    sort: "newest",
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Wallpapers</h1>
          <p className="mt-1 text-zinc-400">{total} wallpaper{total === 1 ? "" : "s"} match your filters.</p>
        </div>
        <Link href="/admin/wallpapers/upload" className="btn btn-primary">Upload</Link>
      </header>

      <form method="get" className="surface grid gap-3 p-4 sm:grid-cols-[1fr_12rem_10rem_auto] sm:items-end" role="search">
        <div>
          <label htmlFor="admin-q" className="label">Search</label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Title, tag, description…" className="field" />
        </div>
        <div>
          <label htmlFor="admin-category" className="label">Category</label>
          <select id="admin-category" name="category" defaultValue={category} className="field">
            <option value="">All categories</option>
            {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="admin-status" className="label">Status</label>
          <select id="admin-status" name="status" defaultValue={status} className="field">
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Filter</button>
      </form>

      <WallpaperManager key={`${q}|${category}|${status}|${page}`} items={items} categories={categories.map(({ id, name }) => ({ id, name }))} />
      <Pagination page={page} totalPages={totalPages} makeHref={(next) => buildHref("/admin/wallpapers", { q, category, status: status === "all" ? undefined : status, page: next > 1 ? next : undefined })} />
    </div>
  );
}
