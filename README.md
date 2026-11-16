# 4K Wallpaper Of Me – OFFICIAL

A real, database-backed wallpaper platform: public gallery (home, explore, categories, detail pages, favorites, about, contact, branded 404) plus a secure admin dashboard to upload, replace, edit, organise and delete wallpapers **without touching source code**.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL via Drizzle ORM · `sharp` for image processing · `zod` for validation.

> New to this? Read [`WALLPAPER_MANAGEMENT_GUIDE.md`](./WALLPAPER_MANAGEMENT_GUIDE.md) — a beginner-friendly, step-by-step guide.

---

## 1. Architecture at a glance

| Concern | Where | Notes |
| --- | --- | --- |
| Wallpaper & category records | PostgreSQL (`src/db/schema.ts`) | Single source of truth. Every gallery, category page, search, sitemap and detail page reads from it. |
| Image files | `content/wallpapers/{original,thumbnails,previews}/` | Originals are stored **byte-for-byte untouched**. Thumbnails (WebP, ≤720×1280) and previews (WebP, ≤1280×2200) are generated automatically. |
| Import inbox | `content/inbox/` | Drop images here, press **Import** in the admin. |
| Image serving | `/media/[kind]/[file]` | Only published wallpapers are served. Versioned URLs (`?v=`) are cached for a year; replacing an image bumps the version. Missing thumbnails show a neutral placeholder instead of a broken icon. |
| Downloads | `/api/download/[id]` | Streams the **original** file as an attachment, counts the download. |
| Admin auth | `src/lib/auth.ts` | Env-configured credentials, HMAC-signed `HttpOnly` + `SameSite=Strict` cookie, constant-time comparison, login rate limit, same-origin check on every mutation. |
| Storage abstraction | `src/lib/storage.ts` | All file IO goes through ~6 functions, so moving to S3/R2 later means re-implementing only this file. |

```
content/                     ← YOUR content (images). Not source code.
  wallpapers/original|thumbnails|previews
  inbox/
src/
  app/(site)/                public pages
  app/admin/                 admin pages (login + protected panel)
  app/api/                   public + admin API routes
  app/media/                 image serving route
  components/                UI (admin/, wallpaper/, explore/, layout/, ui/ …)
  db/                        Drizzle schema + client
  lib/                       config, auth, http helpers, storage, image processing, inbox
  lib/wallpapers/            queries, service (create/replace/delete), bootstrap, starter art
.env.example                 all environment variables, documented
```

**Why a database instead of a JSON file?** Wallpapers need download counters, trending (downloads per day), search, publish/unpublish and an admin that non-developers can use from a phone. A JSON file can't do that safely. The `storage.ts` + `service.ts` split keeps an upgrade path to cloud storage.

---

## 2. Install & run locally

Requirements: Node.js 20+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env          # then edit .env (see section 3)
npx drizzle-kit push          # creates the tables (uses drizzle.config.json)
npm run dev                   # http://localhost:3000
```

On first start the server creates the default categories and **12 clearly-labelled starter wallpapers** (procedurally generated placeholder art, tagged `starter`, shown as "Starter" in the admin). Remove them any time: **Admin → Dashboard → Remove starter wallpapers**.

Production build:

```bash
npm run build
npm run start                 # serves on port 3000 (set PORT to change)
```

Quality checks: `npm run lint`, `npm run typecheck`.

---

## 3. Environment variables

Copy `.env.example` → `.env`. **Never commit `.env`.** None of these are exposed to the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `SITE_URL` | yes in production | Public URL, no trailing slash. Used for canonical URLs, sitemap, Open Graph |
| `ADMIN_USERNAME` | no (default `admin`) | Admin login name |
| `ADMIN_PASSWORD` | yes for admin | 10+ characters. Admin is disabled without it |
| `SESSION_SECRET` | yes for admin | 32+ random characters: `openssl rand -hex 32` |
| `WALLPAPER_STORAGE_DIR` | no | Move image storage (e.g. to a persistent volume). Default `./content/wallpapers` |
| `WALLPAPER_INBOX_DIR` | no | Default `./content/inbox` |
| `MAX_UPLOAD_MB` | no | Per-file limit, default 40 |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | no | Email notification for contact messages (see below) |
| `SOCIAL_INSTAGRAM`, `SOCIAL_TIKTOK`, `SOCIAL_YOUTUBE`, `SOCIAL_X`, `SOCIAL_PINTEREST` | no | Footer links. Only those you set are shown |
| `COOKIE_SECURE` | no | Set `true` if HTTPS is terminated somewhere that doesn't send `x-forwarded-proto` |

### Contact form
Every submission is validated server-side (zod), rate-limited (5 per 10 min per IP), protected by a honeypot and **always saved to the database** → read it in **Admin → Messages**. To additionally receive an email, create a free [Resend](https://resend.com) account, verify your sending domain, and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. Without them the form still works (messages land in the admin inbox).

---

## 4. Managing wallpapers

### Add a new wallpaper
**Option A – Admin upload (recommended):** `/admin` → **Upload** → drop one or many images → choose category/tags → **Upload**. Title defaults to the file name (editable). It appears on the site immediately; its detail page exists automatically at `/wallpaper/<id>`.

**Option B – Inbox folder:** copy images to `content/inbox/` (or `content/inbox/nature/` to auto-assign the *Nature* category — folder name = category URL slug), then **Admin → Upload → Import inbox images**. Imported files are moved to `content/inbox/_imported/`.

### Replace an existing wallpaper
**Admin → Wallpapers → Edit → Replace image.** The ID, URL, title, description, category, tags, featured flag and download count are kept; thumbnail, preview, resolution, aspect ratio, format and file size are regenerated; caches are busted automatically. If the file type changes (e.g. JPG → PNG) the old file is removed.

### Delete a wallpaper
**Admin → Wallpapers → Edit → Delete** (or select several → **Delete**). The record, its download history and all three image files are removed; gallery, category pages, sitemap and search update instantly. Visitors' saved favorites for it disappear automatically.
Prefer to hide instead of delete? Use **Unpublish** (draft).

### Create / edit a category
**Admin → Categories → New category.** Categories feed the navigation chips, filters, category pages and sitemap — nothing is hard-coded. The URL slug is permanent; name, description and order are editable. A category can only be deleted when empty (move wallpapers first via the bulk **Move** action).

### Thumbnails
They are generated automatically from the original whenever you upload or replace, as WebP, and the original is never modified. You never need to create thumbnails manually. Re-upload via **Replace image** to regenerate.

### Tags, featured, publish
Edit on the wallpaper page. *Featured* wallpapers appear in the homepage Featured collection. *Drafts* are invisible to the public (page, images and download return 404) but previewable by you.

---

## 5. Admin dashboard

`/admin` — sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

* **Dashboard:** totals, 14-day download chart, most downloaded, starter-content removal.
* **Wallpapers:** search, filter by category/status, bulk publish/unpublish/feature/move/delete, quick toggles.
* **Upload:** bulk upload with per-file status and errors, inbox import.
* **Edit:** details, replace image, delete.
* **Categories** and **Messages**.

Security: credentials only in env; sessions last 12 h; 8 login attempts / 15 min / IP; every admin endpoint re-checks the session and same-origin; uploads are validated by decoding the real file (extension/MIME are never trusted), limited in size, and limited to JPEG/PNG/WEBP/AVIF; filenames on disk are generated by the server.

---

## 6. Deployment

The app needs (1) Node.js, (2) PostgreSQL, (3) a **persistent disk** for `content/` (or `WALLPAPER_STORAGE_DIR`). Serverless hosts with read-only/ephemeral disks (e.g. Vercel) are **not** suitable for uploads unless you re-implement `src/lib/storage.ts` for S3/R2.

Typical VPS / Docker / Railway / Render (with disk):

1. Provision PostgreSQL; set `DATABASE_URL`.
2. Set `SITE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (+ optional vars).
3. `npm ci && npx drizzle-kit push && npm run build && npm run start`
4. Put it behind HTTPS (Caddy/nginx). Forward `X-Forwarded-Proto` and `Host`.
5. Mount a persistent volume at `content/` (or set `WALLPAPER_STORAGE_DIR`). **Back up the database and this folder together.**
6. Health check: `GET /api/health`.

If you proxy with nginx, allow large bodies: `client_max_body_size 50m;`.

---

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| Login page says "Admin is not configured" | Set `ADMIN_PASSWORD` (10+ chars) and `SESSION_SECRET` (32+ chars), restart |
| "Cross-origin request rejected" | You're calling the API from another origin/domain, or a proxy isn't forwarding `Host`/`X-Forwarded-Host` |
| `relation "wallpapers" does not exist` | Run `npx drizzle-kit push` |
| Upload fails with 413 / "too large" | Raise `MAX_UPLOAD_MB` and your proxy limit |
| "Unsupported image type" | Only JPEG, PNG, WEBP, AVIF are accepted; check the file isn't renamed/corrupt |
| Images show a grey placeholder | The file is missing on disk (e.g. volume not mounted). Restore it or **Replace image** |
| Old image still shows after replace | Hard-refresh once; URLs are versioned so it updates for everyone else automatically |
| Starter wallpapers didn't appear | They are created once, at first boot, on an empty database. Check server logs for `[bootstrap]` |
| Sitemap/canonical URLs say `localhost` | Set `SITE_URL` |
| No contact emails arrive | Messages are always in **Admin → Messages**; email needs the three Resend variables |

---

## 8. Known limitations

* Local-disk storage (documented upgrade path to S3/R2 via `src/lib/storage.ts`).
* Rate limiting is in-memory (per server instance); use a shared store if you run many instances.
* Single admin account (credentials in env).
* Wallpapers are displayed as 9:16 cards (cropped with `object-cover`) in grids; detail pages show the full uncropped image.
