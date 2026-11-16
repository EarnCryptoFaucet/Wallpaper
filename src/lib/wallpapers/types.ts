/** Plain, serialisable shapes shared between server and client components. */
export interface WallpaperSummary {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  width: number;
  height: number;
  resolution: string;
  aspectRatio: string;
  format: string;
  quality: string;
  color: string;
  thumbnailUrl: string;
  featured: boolean;
  published: boolean;
  isDemo: boolean;
  downloads: number;
  publishedAt: string;
}

export interface WallpaperDetail extends WallpaperSummary {
  description: string;
  tags: string[];
  previewUrl: string;
  originalUrl: string;
  downloadUrl: string;
  fileSize: number;
  originalFile: string;
  updatedAt: string;
  createdAt: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  count: number;
  coverUrl: string | null;
  coverColor: string | null;
}

export type SortKey = "newest" | "popular" | "trending" | "featured";
export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Most popular" },
  { key: "trending", label: "Trending" },
  { key: "featured", label: "Featured" },
];

export function isSortKey(value: string | undefined): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

export function mediaUrl(kind: "original" | "thumbnails" | "previews", file: string, version: number): string {
  return `/media/${kind}/${file}?v=${version}`;
}
