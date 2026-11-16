import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WallpaperEditor } from "@/components/admin/WallpaperEditor";
import { requireAdminPage } from "@/lib/auth";
import { storageConfig } from "@/lib/config";
import { getWallpaperDetail, listCategories } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit wallpaper" };

export default async function AdminEditWallpaperPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [wallpaper, categories] = await Promise.all([getWallpaperDetail(id, true), listCategories({ includeEmpty: true })]);
  if (!wallpaper) notFound();
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header>
        <Link href="/admin/wallpapers" className="text-sm text-violet-300 hover:text-white">← All wallpapers</Link>
        <h1 className="font-display mt-2 text-3xl font-semibold text-white">{wallpaper.title}</h1>
      </header>
      <WallpaperEditor wallpaper={wallpaper} categories={categories.map(({ id: categoryId, name }) => ({ id: categoryId, name }))} maxUploadMb={Math.round(storageConfig.maxUploadBytes / 1024 / 1024)} />
    </div>
  );
}
