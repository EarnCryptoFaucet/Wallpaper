import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wallpapers } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { isMediaKind, isSafeFilename, openMediaStream, statMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280"><rect width="720" height="1280" fill="#0f0c1c"/><g fill="none" stroke="#6d5bb0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="300" y="540" width="120" height="160" rx="18"/><path d="M330 620l20 24 20-24"/></g></svg>`;

/**
 * Serves wallpaper files from the content folder. Files are only exposed while their wallpaper is
 * published (admins can still preview drafts). A missing thumbnail/preview returns a neutral
 * placeholder instead of a broken image icon.
 */
export async function GET(request: Request, { params }: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await params;
  if (!isMediaKind(kind) || !isSafeFilename(file)) return new Response("Not found", { status: 404 });

  const id = file.replace(/\.[^.]+$/, "");
  const [record] = await db.select({ published: wallpapers.published }).from(wallpapers).where(eq(wallpapers.id, id)).limit(1);
  if (!record || (!record.published && !(await isAdminAuthenticated()))) return new Response("Not found", { status: 404 });

  const stats = await statMedia(kind, file);
  if (!stats) {
    if (kind === "original") return new Response("Original file is missing", { status: 404 });
    return new Response(PLACEHOLDER_SVG, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" } });
  }

  const etag = `"${stats.size.toString(16)}-${Math.round(stats.mtimeMs).toString(16)}"`;
  const hasVersion = new URL(request.url).searchParams.has("v");
  const headers: Record<string, string> = {
    ETag: etag,
    "Content-Type": CONTENT_TYPES[file.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream",
    "Content-Length": String(stats.size),
    // The ?v= parameter changes whenever an image is replaced, so versioned URLs can be cached forever.
    "Cache-Control": hasVersion ? "public, max-age=31536000, immutable" : "public, max-age=300, must-revalidate",
    "X-Content-Type-Options": "nosniff",
  };
  if (!record.published) headers["Cache-Control"] = "private, no-store";

  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": headers["Cache-Control"] } });

  const body = Readable.toWeb(openMediaStream(kind, file)) as unknown as ReadableStream;
  return new Response(body, { headers });
}
