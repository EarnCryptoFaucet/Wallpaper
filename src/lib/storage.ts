import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { storageConfig } from "@/lib/config";

/**
 * Local-disk storage. Every other module goes through this file, so moving to S3/R2 later
 * only requires re-implementing these few functions.
 */
export type MediaKind = "original" | "thumbnails" | "previews";
export const MEDIA_KINDS: readonly MediaKind[] = ["original", "thumbnails", "previews"];

const SAFE_FILENAME = /^[a-z0-9][a-z0-9._-]{0,150}$/i;

export function isMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value);
}

export function isSafeFilename(filename: string): boolean {
  return SAFE_FILENAME.test(filename) && !filename.includes("..");
}

function resolveMediaPath(kind: MediaKind, filename: string): string {
  if (!isSafeFilename(filename)) throw new Error("Unsafe filename");
  return path.join(storageConfig.root, kind, filename);
}

export async function ensureStorageDirs(): Promise<void> {
  await Promise.all(MEDIA_KINDS.map((kind) => fsp.mkdir(path.join(storageConfig.root, kind), { recursive: true })));
}

/** Writes atomically (temp file + rename) so readers never see half-written images. */
export async function saveMedia(kind: MediaKind, filename: string, data: Buffer): Promise<void> {
  await ensureStorageDirs();
  const target = resolveMediaPath(kind, filename);
  const temp = `${target}.${process.pid}.tmp`;
  await fsp.writeFile(temp, data);
  await fsp.rename(temp, target);
}

export async function removeMedia(kind: MediaKind, filename: string): Promise<void> {
  try {
    await fsp.unlink(resolveMediaPath(kind, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function statMedia(kind: MediaKind, filename: string): Promise<{ size: number; mtimeMs: number } | null> {
  try {
    const stats = await fsp.stat(resolveMediaPath(kind, filename));
    return stats.isFile() ? { size: stats.size, mtimeMs: stats.mtimeMs } : null;
  } catch {
    return null;
  }
}

export function openMediaStream(kind: MediaKind, filename: string): fs.ReadStream {
  return fs.createReadStream(resolveMediaPath(kind, filename));
}

export async function mediaExists(kind: MediaKind, filename: string): Promise<boolean> {
  return (await statMedia(kind, filename)) !== null;
}
