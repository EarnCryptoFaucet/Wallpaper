import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { listCategories, listAllPublishedIds } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, wallpaperList] = await Promise.all([listCategories(), listAllPublishedIds()]);
  const base = siteConfig.url;
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    ...categories.map((category) => ({ url: `${base}/categories/${category.id}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...wallpaperList.map((wallpaper) => ({
      url: `${base}/wallpaper/${wallpaper.id}`,
      lastModified: wallpaper.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
