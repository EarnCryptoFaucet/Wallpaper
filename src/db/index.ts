import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __wallpaperPool?: Pool;
};

/**
 * The pool is created lazily on first use. Importing this module (which Next.js does while building)
 * therefore never fails when DATABASE_URL is not available at build time; a clear error is thrown
 * only when a query is actually attempted without it.
 */
export function getPool(): Pool {
  if (globalForDb.__wallpaperPool) return globalForDb.__wallpaperPool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  // Cache in every environment so a single pool is shared by all modules.
  globalForDb.__wallpaperPool = pool;
  return pool;
}

let drizzleInstance: NodePgDatabase | null = null;

function getDb(): NodePgDatabase {
  drizzleInstance ??= drizzle(getPool());
  return drizzleInstance;
}

export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, property) {
    const instance = getDb();
    const value = Reflect.get(instance, property, instance) as unknown;
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
  },
});
