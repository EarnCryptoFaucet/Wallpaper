import { Readable } from "node:stream";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { downloadEvents, wallpapers } from "@/db/schema";
import { jsonError } from "@/lib/http";
import { openMediaStream, statMedia } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Streams the ORIGINAL file (never the thumbnail/preview) as an attachment and records the download. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [wallpaper] = await db.select().from(wallpapers).where(eq(wallpapers.id, id)).limit(1);
  if (!wallpaper || !wallpaper.published) return jsonError("Wallpaper not found.", 404);

  const stats = await statMedia("original", wallpaper.originalFile);
  if (!stats) return jsonError("The original file is currently unavailable.", 404);

  await Promise.all([
    db.update(wallpapers).set({ downloads: sql`${wallpapers.downloads} + 1` }).where(eq(wallpapers.id, id)),
    db.insert(downloadEvents).values({ wallpaperId: id }),
  ]);

  const extension = wallpaper.originalFile.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${slugify(wallpaper.title) || "wallpaper"}-${wallpaper.width}x${wallpaper.height}.${extension}`;
  const body = Readable.toWeb(openMediaStream("original", wallpaper.originalFile)) as unknown as ReadableStream;
  return new Response(body, {
    headers: {
      "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "Content-Length": String(stats.size),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
