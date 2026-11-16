import type { Metadata } from "next";
import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, wallpapers } from "@/db/schema";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { requireAdminPage } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/wallpapers/bootstrap";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  await ensureBootstrapped();
  const [rows, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ categoryId: wallpapers.categoryId, total: sql<number>`count(*)::int` }).from(wallpapers).groupBy(wallpapers.categoryId),
  ]);
  const countMap = new Map(counts.map((entry) => [entry.categoryId, entry.total]));
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-white">Categories</h1>
        <p className="mt-1 text-zinc-400">Categories drive the navigation, filters and category pages on the website. The URL slug is permanent; names and order can change any time.</p>
      </header>
      <CategoryManager categories={rows.map((row) => ({ id: row.id, name: row.name, description: row.description, sortOrder: row.sortOrder, total: countMap.get(row.id) ?? 0 }))} />
    </div>
  );
}
