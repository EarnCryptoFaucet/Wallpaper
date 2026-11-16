import { NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";
import { bulkUpdate, deleteWallpapers } from "@/lib/wallpapers/service";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1).max(80)).min(1, "Select at least one wallpaper.").max(500),
  action: z.enum(["publish", "unpublish", "feature", "unfeature", "delete", "category"]),
  categoryId: z.string().trim().min(1).max(60).optional(),
});

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  const { ids, action, categoryId } = parsed.data;

  try {
    let affected = 0;
    switch (action) {
      case "publish":
        affected = await bulkUpdate(ids, { published: true });
        break;
      case "unpublish":
        affected = await bulkUpdate(ids, { published: false });
        break;
      case "feature":
        affected = await bulkUpdate(ids, { featured: true });
        break;
      case "unfeature":
        affected = await bulkUpdate(ids, { featured: false });
        break;
      case "category":
        if (!categoryId) return jsonError("Choose a category.", 400);
        affected = await bulkUpdate(ids, { categoryId });
        break;
      case "delete":
        affected = await deleteWallpapers(ids);
        break;
    }
    return NextResponse.json({ affected });
  } catch (error) {
    return toErrorResponse(error);
  }
}
