import { NextResponse } from "next/server";
import { readUploadedFile, toErrorResponse } from "@/lib/admin-api";
import { guardAdmin } from "@/lib/http";
import { replaceWallpaperImage } from "@/lib/wallpapers/service";

export const dynamic = "force-dynamic";

/** Replace the image of an existing wallpaper while keeping its id, URL, metadata and statistics. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const form = await request.formData();
    const { buffer } = await readUploadedFile(form.get("file"));
    const row = await replaceWallpaperImage(id, buffer);
    return NextResponse.json({ wallpaper: { id: row.id, resolution: row.resolution, imageVersion: row.imageVersion } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
