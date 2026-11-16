import crypto from "node:crypto";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Stable, readable, URL-safe wallpaper id such as "violet-horizon-k3f9a2". Created once, never changed. */
export function createWallpaperId(title: string): string {
  const base = slugify(title) || "wallpaper";
  const suffix = crypto.randomBytes(4).toString("hex").slice(0, 6);
  return `${base}-${suffix}`;
}

export function humanizeFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const spaced = withoutExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!spaced) return "Untitled wallpaper";
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase()).slice(0, 120);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

const COMMON_RATIOS: Array<[string, number]> = [
  ["9:16", 9 / 16],
  ["9:19.5", 9 / 19.5],
  ["9:20", 9 / 20],
  ["9:21", 9 / 21],
  ["9:18", 9 / 18],
  ["10:16", 10 / 16],
  ["3:4", 3 / 4],
  ["2:3", 2 / 3],
  ["4:5", 4 / 5],
  ["1:1", 1],
  ["16:9", 16 / 9],
  ["19.5:9", 19.5 / 9],
  ["21:9", 21 / 9],
  ["16:10", 16 / 10],
  ["3:2", 3 / 2],
  ["4:3", 4 / 3],
];

export function computeAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  const match = COMMON_RATIOS.find(([, value]) => Math.abs(value - ratio) / ratio < 0.012);
  if (match) return match[0];
  return ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;
}

export function computeResolution(width: number, height: number): string {
  return `${width} × ${height}`;
}

/** Marketing-style quality label derived from the longest edge. */
export function qualityLabel(width: number, height: number): string {
  const longest = Math.max(width, height);
  if (longest >= 7680) return "8K";
  if (longest >= 3840) return "4K";
  if (longest >= 2560) return "2K";
  if (longest >= 1920) return "Full HD";
  return "HD";
}

export function parseTags(input: string | string[] | undefined | null): string[] {
  const raw = Array.isArray(input) ? input : (input ?? "").split(/[,\n]/);
  const unique = new Set<string>();
  for (const entry of raw) {
    const tag = entry
      .toLowerCase()
      .replace(/[^a-z0-9 \-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 32);
    if (tag) unique.add(tag);
    if (unique.size >= 20) break;
  }
  return [...unique];
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
