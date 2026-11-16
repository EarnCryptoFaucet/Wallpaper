import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExploreView, readParam } from "@/components/explore/ExploreView";
import { PageHeading, PageShell } from "@/components/ui/common";
import { getCategory } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} Wallpapers`,
    description: category.description || `Download premium 4K ${category.name.toLowerCase()} phone wallpapers in original resolution.`,
    alternates: { canonical: `/categories/${category.id}` },
    openGraph: { title: `${category.name} Wallpapers`, url: `/categories/${category.id}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <PageShell className="pb-10">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-zinc-500">
        <Link href="/categories" className="hover:text-white">Categories</Link> <span aria-hidden="true">/</span>{" "}
        <span className="text-zinc-300">{category.name}</span>
      </nav>
      <PageHeading eyebrow="Category" title={`${category.name} wallpapers`} description={category.description} />
      <ExploreView
        basePath={`/categories/${category.id}`}
        fixedCategoryId={category.id}
        params={{ q: readParam(query.q), sort: readParam(query.sort), featured: readParam(query.featured), page: readParam(query.page) }}
      />
    </PageShell>
  );
}
