import sharp, { type Metadata } from "sharp";

export class ImageValidationError extends Error {}

export type StoredFormat = "jpg" | "png" | "webp" | "avif";

export interface ProcessedImage {
  format: StoredFormat;
  /** File extension to use for the untouched original. */
  extension: StoredFormat;
  width: number;
  height: number;
  color: string;
  thumbnail: Buffer;
  preview: Buffer;
  fileSize: number;
}

const THUMB_PORTRAIT = { width: 720, height: 1280 };
const THUMB_LANDSCAPE = { width: 1280, height: 720 };
const PREVIEW_BOX = { width: 1280, height: 2200 };
const MAX_PIXELS = 300_000_000;

function detectFormat(metadata: Metadata): StoredFormat | null {
  switch (metadata.format) {
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    case "heif":
      return metadata.compression === "av1" ? "avif" : null;
    default:
      return null;
  }
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Validates the REAL file contents (never the filename or MIME type from the browser),
 * reads true dimensions, and derives a thumbnail + preview. The original buffer is never re-encoded.
 */
export async function processImage(original: Buffer): Promise<ProcessedImage> {
  if (original.length === 0) throw new ImageValidationError("The file is empty.");

  let metadata: Metadata;
  try {
    metadata = await sharp(original, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new ImageValidationError("This file is not a readable image.");
  }

  const format = detectFormat(metadata);
  if (!format) throw new ImageValidationError("Unsupported image type. Use JPEG, PNG, WEBP or AVIF.");
  if (!metadata.width || !metadata.height) throw new ImageValidationError("Could not read the image dimensions.");

  // EXIF orientations 5-8 are rotated by 90°, so the displayed size is swapped.
  const rotated = (metadata.orientation ?? 1) >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (width < 200 || height < 200) throw new ImageValidationError("Image is too small (minimum 200 × 200 pixels).");

  const box = width > height ? THUMB_LANDSCAPE : THUMB_PORTRAIT;
  try {
    const [thumbnail, preview] = await Promise.all([
      sharp(original, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ ...box, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 76 })
        .toBuffer(),
      sharp(original, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ ...PREVIEW_BOX, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer(),
    ]);
    const stats = await sharp(thumbnail).stats();
    const color = toHex(stats.dominant.r, stats.dominant.g, stats.dominant.b);
    return { format, extension: format, width, height, color, thumbnail, preview, fileSize: original.length };
  } catch {
    throw new ImageValidationError("The image could not be decoded. It may be corrupted.");
  }
}
