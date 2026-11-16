import { NextResponse } from "next/server";
import { z } from "zod";
import { formFlag, readUploadedFile, toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";
import { humanizeFilename, parseTags } from "@/lib/utils";
import { createWallpaper } from "@/lib/wallpapers/service";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  title: z.string().trim().max(120),
  description: z.string().trim().max(2000),
  categoryId: z.string().trim().min(1, "Choose a category.").max(60),
});

/** Upload ONE wallpaper (multipart). The admin UI calls this once per file for bulk uploads. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const parsed = uploadSchema.safeParse({
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
    });
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);

    const { buffer, name } = await readUploadedFile(form.get("file"));
    const row = await createWallpaper({
      buffer,
      title: parsed.data.title || humanizeFilename(name),
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      tags: parseTags(String(form.get("tags") ?? "")),
      featured: formFlag(form.get("featured"), false),
      published: formFlag(form.get("published"), true),
    });
    return NextResponse.json({ wallpaper: { id: row.id, title: row.title } }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
