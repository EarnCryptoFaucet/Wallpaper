import type { Metadata } from "next";
import { ExploreView, readParam } from "@/components/explore/ExploreView";
import { PageHeading, PageShell } from "@/components/ui/common";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const q = readParam(params.q)?.trim();
  const isFiltered = Boolean(q || readParam(params.category) || readParam(params.sort) || readParam(params.featured) || readParam(params.page));
  return {
    title: q ? `Search results for “${q.slice(0, 60)}”` : "Explore Wallpapers",
    description: "Search and filter the full collection of premium 4K phone wallpapers. Sort by newest, most popular, trending or featured.",
    alternates: { canonical: "/explore" },
    // Filtered/paginated/search URLs are for people, not for the search index.
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <PageShell className="pb-10">
      <PageHeading eyebrow="Explore" title="Find your next wallpaper" description="Search by title, tag or category, then narrow down and sort the collection." />
      <ExploreView
        basePath="/explore"
        params={{
          q: readParam(params.q),
          category: readParam(params.category),
          sort: readParam(params.sort),
          featured: readParam(params.featured),
          page: readParam(params.page),
        }}
      />
    </PageShell>
  );
}
