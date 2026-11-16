import fsp from "node:fs/promises";
import path from "node:path";
import { ALLOWED_EXTENSIONS, storageConfig } from "@/lib/config";
import { createWallpaper } from "@/lib/wallpapers/service";
import { humanizeFilename, slugify } from "@/lib/utils";
import { db } from "@/db";
import { categories } from "@/db/schema";

const IMPORTED_DIR = "_imported";

export interface InboxFile {
  /** Path relative to the inbox folder. */
  relativePath: string;
  folder: string | null;
  filename: string;
}

function hasAllowedExtension(filename: string): boolean {
  const extension = path.extname(filename).slice(1).toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(extension);
}

/** Lists images in `content/inbox` (top level and one level of sub-folders; `_imported` is ignored). */
export async function scanInbox(): Promise<InboxFile[]> {
  await fsp.mkdir(storageConfig.inbox, { recursive: true });
  const result: InboxFile[] = [];
  const topLevel = await fsp.readdir(storageConfig.inbox, { withFileTypes: true });
  for (const entry of topLevel) {
    if (entry.name.startsWith(".") || entry.name === IMPORTED_DIR) continue;
    if (entry.isFile() && hasAllowedExtension(entry.name)) {
      result.push({ relativePath: entry.name, folder: null, filename: entry.name });
    } else if (entry.isDirectory()) {
      const children = await fsp.readdir(path.join(storageConfig.inbox, entry.name), { withFileTypes: true });
      for (const child of children) {
        if (child.isFile() && !child.name.startsWith(".") && hasAllowedExtension(child.name)) {
          result.push({ relativePath: path.join(entry.name, child.name), folder: entry.name, filename: child.name });
        }
      }
    }
  }
  return result.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export interface ImportResult {
  imported: Array<{ id: string; title: string }>;
  failed: Array<{ file: string; error: string }>;
}

/**
 * Imports every image from the inbox. A sub-folder named after a category id (e.g. `inbox/nature/`)
 * assigns that category automatically. Imported files are moved to `inbox/_imported/`, never deleted.
 */
export async function importInbox(options: { defaultCategoryId: string; published: boolean }): Promise<ImportResult> {
  const knownCategories = new Set((await db.select({ id: categories.id }).from(categories)).map((row) => row.id));
  const files = await scanInbox();
  const result: ImportResult = { imported: [], failed: [] };
  const importedDir = path.join(storageConfig.inbox, IMPORTED_DIR);

  for (const file of files) {
    const absolute = path.join(storageConfig.inbox, file.relativePath);
    try {
      const stats = await fsp.stat(absolute);
      if (stats.size > storageConfig.maxUploadBytes) throw new Error("File is larger than the maximum upload size.");
      const buffer = await fsp.readFile(absolute);
      const folderCategory = file.folder ? slugify(file.folder) : null;
      const categoryId = folderCategory && knownCategories.has(folderCategory) ? folderCategory : options.defaultCategoryId;
      const title = humanizeFilename(file.filename);
      const row = await createWallpaper({ buffer, title, categoryId, published: options.published, tags: [] });
      result.imported.push({ id: row.id, title });
      await fsp.mkdir(importedDir, { recursive: true });
      await fsp.rename(absolute, path.join(importedDir, `${Date.now()}-${path.basename(file.filename)}`));
    } catch (error) {
      result.failed.push({ file: file.relativePath, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  return result;
}
