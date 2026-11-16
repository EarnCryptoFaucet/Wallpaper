import { NextResponse } from "next/server";
import { storageConfig } from "@/lib/config";
import { jsonError } from "@/lib/http";
import { ImageValidationError, WallpaperServiceError } from "@/lib/wallpapers/service";

/** Reads an uploaded file with a server-side size limit. Content validation happens in processImage(). */
export async function readUploadedFile(entry: FormDataEntryValue | null): Promise<{ buffer: Buffer; name: string }> {
  if (!(entry instanceof File) || entry.size === 0) throw new WallpaperServiceError("No file was uploaded.", 400);
  if (entry.size > storageConfig.maxUploadBytes) {
    throw new WallpaperServiceError(`File is too large. The maximum size is ${Math.round(storageConfig.maxUploadBytes / 1024 / 1024)} MB.`, 413);
  }
  return { buffer: Buffer.from(await entry.arrayBuffer()), name: entry.name };
}

/** Converts known failures into clean JSON errors; unknown errors are logged and hidden from the client. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof WallpaperServiceError) return jsonError(error.message, error.status);
  if (error instanceof ImageValidationError) return jsonError(error.message, 422);
  console.error("[admin-api]", error);
  return jsonError("Unexpected server error. Check the server logs for details.", 500);
}

export function formFlag(value: FormDataEntryValue | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return value === "true" || value === "on" || value === "1";
}
