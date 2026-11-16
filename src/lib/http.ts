import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Browsers always send Origin on cross-site and same-site POST/PATCH/DELETE; reject mismatches (CSRF defence in depth). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Guard for state-changing admin endpoints. Returns an error response, or null when the request is allowed. */
export async function guardAdmin(request: Request): Promise<NextResponse | null> {
  if (!isSameOrigin(request)) return jsonError("Cross-origin request rejected.", 403);
  if (!(await isAdminAuthenticated())) return jsonError("Not authorised. Please sign in again.", 401);
  return null;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Small in-memory limiter. Good for a single server instance; swap for Redis if you scale horizontally. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [bucketKey, value] of buckets) if (value.resetAt < now) buckets.delete(bucketKey);
    }
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
