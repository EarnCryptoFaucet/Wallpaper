import path from "node:path";

export const siteConfig = {
  name: "4K Wallpaper Of Me – OFFICIAL",
  shortName: "4K Wallpaper Of Me",
  tagline: "Premium 4K wallpapers for your phone",
  description:
    "Discover and download premium, original-resolution 4K wallpapers for your phone. Minimalist, abstract, space, dark, aesthetic and more — free to browse, easy to save.",
  url: (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
} as const;

export const storageConfig = {
  /** Holds original/, thumbnails/ and previews/ sub-folders. */
  root: path.resolve(process.env.WALLPAPER_STORAGE_DIR ?? path.join(/* turbopackIgnore: true */ process.cwd(), "content", "wallpapers")),
  /** Drop images here, then press "Import" in the admin dashboard. */
  inbox: path.resolve(process.env.WALLPAPER_INBOX_DIR ?? path.join(/* turbopackIgnore: true */ process.cwd(), "content", "inbox")),
  maxUploadBytes: Math.max(1, Number(process.env.MAX_UPLOAD_MB ?? 40)) * 1024 * 1024,
} as const;

export const PAGE_SIZE = 24;
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export interface SocialLink {
  label: string;
  href: string;
}

/** Only social links configured through environment variables are displayed. */
export function getSocialLinks(): SocialLink[] {
  const candidates: Array<[string, string | undefined]> = [
    ["Instagram", process.env.SOCIAL_INSTAGRAM],
    ["TikTok", process.env.SOCIAL_TIKTOK],
    ["YouTube", process.env.SOCIAL_YOUTUBE],
    ["X", process.env.SOCIAL_X],
    ["Pinterest", process.env.SOCIAL_PINTEREST],
  ];
  return candidates
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && /^https?:\/\//.test(entry[1]))
    .map(([label, href]) => ({ label, href }));
}
