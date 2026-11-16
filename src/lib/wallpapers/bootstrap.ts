import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { db, getPool } from "@/db";
import { categories, settings, wallpapers } from "@/db/schema";

/** Categories created on first launch. After that they are owned by the admin dashboard. */
export const DEFAULT_CATEGORIES: Array<{ id: string; name: string; description: string }> = [
  { id: "minimalist", name: "Minimalist", description: "Clean shapes, calm space and quiet focus." },
  { id: "abstract", name: "Abstract", description: "Colour, form and flow without boundaries." },
  { id: "nature", name: "Nature", description: "Mountains, forests, oceans and skies." },
  { id: "animals", name: "Animals", description: "Wildlife and companions in stunning detail." },
  { id: "cats", name: "Cats", description: "Elegant, curious and always photogenic." },
  { id: "dark", name: "Dark", description: "Deep blacks, perfect for OLED displays." },
  { id: "aesthetic", name: "Aesthetic", description: "Soft moods, dreamy palettes and modern vibes." },
  { id: "space", name: "Space", description: "Planets, nebulae and endless starfields." },
  { id: "fantasy", name: "Fantasy", description: "Other worlds, castles and impossible places." },
  { id: "anime", name: "Anime", description: "Stylised scenes and illustrated characters." },
  { id: "architecture", name: "Architecture", description: "Skylines, structures and urban geometry." },
  { id: "motivational", name: "Motivational", description: "Words and images to keep you moving." },
  { id: "3d-art", name: "3D Art", description: "Rendered worlds, glossy forms and digital sculpture." },
];

let bootstrapPromise: Promise<void> | null = null;

/**
 * Runs once per database: creates the default categories and the clearly-labelled starter wallpapers.
 * Safe to call on every request (memoised in-process, claimed via the `settings` table across processes).
 */
export function ensureBootstrapped(): Promise<void> {
  bootstrapPromise ??= runBootstrap().catch((error) => {
    bootstrapPromise = null;
    throw error;
  });
  return bootstrapPromise;
}

/** Arbitrary constant identifying this app's bootstrap lock in PostgreSQL. */
const BOOTSTRAP_LOCK_ID = 727_001;

async function runBootstrap(): Promise<void> {
  // Cheap check first: nothing to do once a previous run finished.
  const done = await db.select().from(settings).where(eq(settings.key, "bootstrapped")).limit(1);
  if (done[0]?.value === "done") return;

  // A session-level advisory lock is released automatically if the process dies mid-way, so an
  // interrupted first launch can never leave the site permanently half-initialised.
  const client = await getPool().connect();
  try {
    const { rows } = await client.query<{ locked: boolean }>("select pg_try_advisory_lock($1) as locked", [BOOTSTRAP_LOCK_ID]);
    if (!rows[0]?.locked) return; // another process is already preparing the content
    try {
      const recheck = await db.select().from(settings).where(eq(settings.key, "bootstrapped")).limit(1);
      if (recheck[0]?.value === "done") return;

      await db
        .insert(categories)
        .values(DEFAULT_CATEGORIES.map((category, index) => ({ ...category, sortOrder: index })))
        .onConflictDoNothing();

      const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(wallpapers);
      if (count === 0) await seedStarterWallpapers();

      await db
        .insert(settings)
        .values({ key: "bootstrapped", value: "done" })
        .onConflictDoUpdate({ target: settings.key, set: { value: "done" } });
    } finally {
      await client.query("select pg_advisory_unlock($1)", [BOOTSTRAP_LOCK_ID]);
    }
  } finally {
    client.release();
  }
}

async function seedStarterWallpapers(): Promise<void> {
  // Imported lazily so the heavy generator code is only loaded on a brand-new install.
  const [{ DEMO_WALLPAPERS }, { createWallpaper }] = await Promise.all([
    import("@/lib/wallpapers/demo-art"),
    import("@/lib/wallpapers/service"),
  ]);
  for (const spec of DEMO_WALLPAPERS) {
    const raster = sharp(Buffer.from(spec.svg()));
    const buffer =
      spec.format === "png"
        ? await raster.png({ compressionLevel: 9 }).toBuffer()
        : spec.format === "webp"
          ? await raster.webp({ quality: 92 }).toBuffer()
          : await raster.jpeg({ quality: 92 }).toBuffer();
    await createWallpaper({
      buffer,
      title: spec.title,
      description: spec.description,
      categoryId: spec.categoryId,
      tags: spec.tags,
      featured: spec.featured,
      published: true,
      isDemo: true,
    });
  }
}
