import { NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";
import { parseTags } from "@/lib/utils";
import { deleteWallpapers, updateWallpaper } from "@/lib/wallpapers/service";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().trim().min(1).max(60).optional(),
  tags: z.array(z.string()).max(40).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  try {
    const { tags, ...rest } = parsed.data;
    const row = await updateWallpaper(id, { ...rest, ...(tags ? { tags: parseTags(tags) } : {}) });
    return NextResponse.json({ wallpaper: { id: row.id } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const removed = await deleteWallpapers([id]);
    if (removed === 0) return jsonError("Wallpaper not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
