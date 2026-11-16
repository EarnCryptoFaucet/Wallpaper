import Link from "next/link";
import { CategoryCard } from "@/components/category/CategoryCard";
import { EmptyState, PageShell, SearchForm, SectionHeading } from "@/components/ui/common";
import { WallpaperGrid, WallpaperRail, wallpaperAlt } from "@/components/wallpaper/WallpaperCard";
import { listCategories, listWallpapers, getSiteStats } from "@/lib/wallpapers/queries";
import { formatNumber } from "@/lib/utils";
import type { WallpaperSummary } from "@/lib/wallpapers/types";

export const dynamic = "force-dynamic";

const PHONE_LAYOUT = [
  { className: "left-[27%] top-0 z-20 w-[46%] animate-float", rotate: "0deg" },
  { className: "left-0 top-[14%] z-10 w-[39%]", rotate: "-8deg" },
  { className: "left-[61%] top-[14%] z-10 w-[39%]", rotate: "8deg" },
];

function HeroPhones({ wallpapers }: { wallpapers: WallpaperSummary[] }) {
  return (
    <div className="relative mx-auto h-104 w-full max-w-md sm:h-136 lg:h-152" aria-label="Featured wallpapers preview">
      <div className="absolute top-1/4 left-1/2 size-72 -translate-x-1/2 rounded-full bg-violet-600/30 blur-[90px]" aria-hidden="true" />
      {wallpapers.slice(0, 3).map((wallpaper, index) => {
        const layout = PHONE_LAYOUT[index];
        if (!layout) return null;
        return (
          <Link
            key={wallpaper.id}
            href={`/wallpaper/${wallpaper.id}`}
            className={`absolute block aspect-[9/19.5] overflow-hidden rounded-[1.9rem] border-[5px] border-zinc-800/90 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 transition hover:scale-[1.03] ${layout.className}`}
            style={{ transform: `rotate(${layout.rotate})`, backgroundColor: wallpaper.color }}
            aria-label={`${wallpaper.title} — view wallpaper`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wallpaper.thumbnailUrl} alt={wallpaperAlt(wallpaper)} width={360} height={780} loading="eager" fetchPriority="high" decoding="async" className="size-full object-cover" />
            <span className="absolute top-2 left-1/2 h-4 w-1/4 -translate-x-1/2 rounded-full bg-black/80" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

export default async function HomePage() {
  const [featured, latest, popular, trending, categories, stats] = await Promise.all([
    listWallpapers({ featured: true, sort: "newest", limit: 10 }),
    listWallpapers({ sort: "newest", limit: 8 }),
    listWallpapers({ sort: "popular", limit: 10 }),
    listWallpapers({ sort: "trending", limit: 6 }),
    listCategories(),
    getSiteStats(),
  ]);

  const heroWallpapers = featured.length >= 3 ? featured : [...featured, ...latest].slice(0, 3);
  const popularIds = new Set(popular.slice(0, 6).map((item) => item.id));
  const trendingIsDistinct = trending.some((item) => !popularIds.has(item.id));

  return (
    <>
      <section className="relative overflow-hidden">
        <PageShell className="grid items-center gap-10 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <div className="animate-fade-up">
            <p className="eyebrow">Official · Original resolution</p>
            <h1 className="font-display mt-4 text-[2.6rem] leading-[1.02] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Wallpapers that make your screen feel{" "}
              <span className="bg-linear-to-r from-violet-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent">alive.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              A premium collection of 4K phone wallpapers. Browse by mood, preview in high quality, and download the untouched original file.
            </p>
            <div className="mt-8 max-w-xl">
              <SearchForm size="lg" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Popular categories">
              {categories.slice(0, 5).map((category) => (
                <Link key={category.id} href={`/categories/${category.id}`} className="chip">
                  {category.name}
                </Link>
              ))}
            </div>
            <dl className="mt-10 flex gap-8 text-sm">
              <div>
                <dt className="text-zinc-500">Wallpapers</dt>
                <dd className="font-display text-2xl font-semibold text-white">{formatNumber(stats.wallpapers)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Categories</dt>
                <dd className="font-display text-2xl font-semibold text-white">{stats.categories}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Downloads</dt>
                <dd className="font-display text-2xl font-semibold text-white">{formatNumber(stats.downloads)}</dd>
              </div>
            </dl>
          </div>
          {heroWallpapers.length > 0 && <HeroPhones wallpapers={heroWallpapers} />}
        </PageShell>
      </section>

      {stats.wallpapers === 0 ? (
        <PageShell className="py-10">
          <EmptyState
            title="The collection is being prepared"
            description="No wallpapers have been published yet. Please check back soon."
            actionHref="/contact"
            actionLabel="Get in touch"
          />
        </PageShell>
      ) : (
        <div className="grid gap-20">
          {featured.length > 0 && (
            <PageShell>
              <SectionHeading eyebrow="Hand-picked" title="Featured collection" href="/explore?featured=1" />
              <WallpaperRail wallpapers={featured} label="Featured wallpapers" />
            </PageShell>
          )}

          <PageShell>
            <SectionHeading eyebrow="Just added" title="Latest wallpapers" href="/explore" />
            <WallpaperGrid wallpapers={latest} />
          </PageShell>

          {categories.length > 0 && (
            <PageShell>
              <SectionHeading eyebrow="Browse by mood" title="Categories" href="/categories" linkLabel="All categories" />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <CategoryCard category={category} />
                  </li>
                ))}
              </ul>
            </PageShell>
          )}

          <PageShell>
            <SectionHeading eyebrow="Fan favourites" title="Most popular" href="/explore?sort=popular" />
            <WallpaperRail wallpapers={popular} label="Most popular wallpapers" />
          </PageShell>

          {trendingIsDistinct && (
            <PageShell>
              <SectionHeading eyebrow="This week" title="Trending now" href="/explore?sort=trending" />
              <WallpaperGrid wallpapers={trending} />
            </PageShell>
          )}
        </div>
      )}
    </>
  );
}
