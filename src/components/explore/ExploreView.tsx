import Link from "next/link";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperCard";
import { buildHref, EmptyState, Pagination, SearchForm } from "@/components/ui/common";
import { PAGE_SIZE } from "@/lib/config";
import { listCategories, queryWallpapers } from "@/lib/wallpapers/queries";
import { isSortKey, SORT_OPTIONS, type SortKey } from "@/lib/wallpapers/types";

export interface ExploreParams {
  q?: string;
  category?: string;
  sort?: string;
  featured?: string;
  page?: string;
}

export function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Server-rendered discovery grid: search + category filter + sort + pagination, all driven by the URL. */
export async function ExploreView({
  basePath,
  params,
  fixedCategoryId,
}: {
  basePath: string;
  params: ExploreParams;
  fixedCategoryId?: string;
}) {
  const q = (params.q ?? "").trim().slice(0, 80);
  const sort: SortKey = isSortKey(params.sort) ? params.sort : "newest";
  const featured = params.featured === "1";
  const page = Math.max(1, Math.min(Number.parseInt(params.page ?? "1", 10) || 1, 500));
  const categories = await listCategories();
  const categoryId = fixedCategoryId ?? (categories.some((entry) => entry.id === params.category) ? params.category : undefined);

  const { items, total } = await queryWallpapers({ q, categoryId, featured, sort, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const makeHref = (next: number) =>
    buildHref(basePath, { q, category: fixedCategoryId ? undefined : categoryId, sort: sort === "newest" ? undefined : sort, featured: featured && "1", page: next > 1 ? next : undefined });
  const filterHref = (overrides: Record<string, string | undefined | false>) =>
    buildHref(basePath, {
      q,
      category: fixedCategoryId ? undefined : categoryId,
      sort: sort === "newest" ? undefined : sort,
      featured: featured && "1",
      ...overrides,
    });

  return (
    <>
      <div className="grid gap-5">
        <div className="max-w-2xl">
          <SearchForm
            action={basePath}
            defaultValue={q}
            hidden={{ category: fixedCategoryId ? undefined : categoryId, sort: sort === "newest" ? undefined : sort, featured: featured ? "1" : undefined }}
          />
        </div>

        {!fixedCategoryId && (
          <nav aria-label="Filter by category" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={filterHref({ category: undefined })} aria-current={!categoryId ? "true" : undefined} className={`chip shrink-0 ${!categoryId ? "chip-active" : ""}`}>
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={filterHref({ category: category.id })}
                aria-current={categoryId === category.id ? "true" : undefined}
                className={`chip shrink-0 ${categoryId === category.id ? "chip-active" : ""}`}
              >
                {category.name}
                <span className="ml-2 text-xs text-zinc-500">{category.count}</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/6 py-3">
          <nav aria-label="Sort wallpapers" className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {SORT_OPTIONS.filter((option) => option.key !== "featured").map((option) => (
              <Link
                key={option.key}
                href={filterHref({ sort: option.key === "newest" ? undefined : option.key, page: undefined })}
                aria-current={sort === option.key ? "true" : undefined}
                className={`chip shrink-0 ${sort === option.key ? "chip-active" : ""}`}
              >
                {option.label}
              </Link>
            ))}
            <Link
              href={filterHref({ featured: featured ? undefined : "1", page: undefined })}
              aria-pressed={featured}
              className={`chip shrink-0 ${featured ? "chip-active" : ""}`}
            >
              ★ Featured only
            </Link>
          </nav>
          <p className="text-sm text-zinc-400" aria-live="polite">
            {total} {total === 1 ? "wallpaper" : "wallpapers"}
            {q && (
              <>
                {" "}for “<span className="text-white">{q}</span>”
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {items.length > 0 ? (
          <>
            <WallpaperGrid wallpapers={items} priorityCount={4} />
            <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
          </>
        ) : (
          <EmptyState
            title={q ? `No wallpapers match “${q}”` : "No wallpapers here yet"}
            description={q ? "Try a different keyword, check the spelling, or clear the filters to see everything." : "New wallpapers are added regularly. Check back soon or explore another category."}
            actionHref={fixedCategoryId ? "/explore" : basePath}
            actionLabel={fixedCategoryId ? "Explore all wallpapers" : "Clear all filters"}
          />
        )}
      </div>
    </>
  );
}
