import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "wp_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

/** Admin is only enabled when a password (10+ chars) and a 32+ char session secret are configured. */
export function isAdminConfigured(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password && password.length >= 10 && getSecret());
}

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

export function verifyCredentials(username: string, password: string): boolean {
  if (!isAdminConfigured()) return false;
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  // Compare fixed-length digests in constant time; evaluate both to avoid leaking which one failed.
  const userOk = crypto.timingSafeEqual(digest(username), digest(expectedUser));
  const passOk = crypto.timingSafeEqual(digest(password), digest(expectedPassword));
  return userOk && passOk;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createToken(secret: string): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token: string, secret: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function createAdminSession(): Promise<void> {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const requestHeaders = await headers();
  const isHttps = requestHeaders.get("x-forwarded-proto") === "https" || process.env.COOKIE_SECURE === "true";
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !isAdminConfigured()) return false;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token, secret) : false;
}

/** Use at the top of every admin page. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
