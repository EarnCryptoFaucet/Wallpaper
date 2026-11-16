import type { Metadata } from "next";
import { CategoryCard } from "@/components/category/CategoryCard";
import { EmptyState, PageHeading, PageShell } from "@/components/ui/common";
import { listCategories } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallpaper Categories",
  description: "Browse 4K phone wallpapers by category: minimalist, abstract, nature, space, dark, aesthetic, fantasy, architecture and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <PageShell className="pb-10">
      <PageHeading eyebrow="Categories" title="Browse by mood" description="Every category is a curated collection. Pick a style and dive in." />
      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Categories appear here as soon as wallpapers are published in them." actionHref="/explore" actionLabel="Explore" />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
