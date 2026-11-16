# Bug-fix report

| # | Severity | File | Problem | Fix |
|---|----------|------|---------|-----|
| 1 | High | `src/db/index.ts` | Threw `DATABASE_URL is required` at import time, so `next build` (Docker / CI / Railway build step) failed when the variable was not set during the build. | Pool is created lazily on first query; clear error only when a query really runs. |
| 2 | High | `src/lib/wallpapers/bootstrap.ts` | First-launch setup was guarded by a `settings` flag set to `running`. If the process was stopped mid-seed (deploy restart, crash, dev reload) the flag stayed `running` forever → no default categories, empty site, empty category dropdowns. | Replaced by a PostgreSQL advisory lock (auto-released if the process dies) + `done` flag written only on success. |
| 3 | High | `src/components/admin/UploadManager.tsx` | `crypto.randomUUID()` is undefined on plain `http://` non-localhost origins → picking files crashed and uploading was impossible on an HTTP server/IP. | Counter-based keys that work everywhere. |
| 4 | Medium | `src/lib/wallpapers/queries.ts` | Related-wallpapers query built SQL with `sql.raw` and string escaping. | Fully parameterised `ARRAY[...]` query. |
| 5 | Medium | `src/lib/wallpapers/service.ts` | Bulk "Publish" did not refresh `publishedAt` (single publish did) → inconsistent "Newest" order. | Same `CASE` logic applied in bulk updates. |
| 6 | Medium | `src/app/(site)/page.tsx` | `aspect-9/19.5` is not a guaranteed Tailwind v4 class (non-integer ratio) → hero phone frames could lose their shape. | `aspect-[9/19.5]`. |
| 7 | Low | `src/components/wallpaper/FavoritesView.tsx` | "No favorites yet" flashed before hydration for users who have favorites. | Skeleton shown until hydrated. |
| 8 | Low | `queries.ts` / wallpaper page | Same wallpaper queried twice per request (metadata + page). | Wrapped in React `cache`. |
| 9 | Low | `admin/wallpapers/page.tsx` | Bulk selection leaked across filter/page changes. | `key` resets the manager. |
| 10 | Setup | `package.json`, `drizzle.config.*` | No `db:push` script; hard-coded DB URL in drizzle config; template package name. | `npm run db:push`, `drizzle.config.ts` reads `DATABASE_URL`, proper name. |
| + | New | `Dockerfile`, `docker-compose.yml` | — | One-command run: `docker compose up --build`. |
