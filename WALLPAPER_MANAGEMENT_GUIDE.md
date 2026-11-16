# Wallpaper Management Guide (no coding required)

Everything below is done in your browser from the admin dashboard. You never edit source code.

## 0. Sign in
1. Open `https://your-site/admin`.
2. Enter the **username** and **password** that are set in your `.env` file (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
3. Use **Sign out** when you're done on a shared device.

## 1. First thing: remove the starter wallpapers
The site ships with 12 generated placeholder wallpapers (tagged **Starter**). They are *not* your collection.
1. **Dashboard** → yellow box → **Remove starter wallpapers** → confirm.
2. Your own uploads are never affected.

## 2. Add wallpapers
1. **Upload** (left menu).
2. Drag your images into the box (or tap it and pick files — you can pick many at once).
3. Pick the **Category**, optionally add **Tags** (`purple, minimal, night`), tick **Publish immediately** and/or **Mark as featured**.
4. Edit any title in the list if you want (otherwise the file name is used).
5. Press **Upload**. Each file shows *Uploaded* or the exact error.

Accepted: **JPG/JPEG, PNG, WEBP, AVIF**, up to 40 MB each (changeable).
What happens automatically: the original is stored untouched, a thumbnail and preview are created, resolution / aspect ratio / format / size are read from the image, and the wallpaper page appears at `/wallpaper/<id>`.

### Alternative: the inbox folder (handy for hundreds of files)
1. Copy images into `content/inbox/` on the server.
   * Want them in *Nature* automatically? Put them in `content/inbox/nature/`. (Folder name = category URL, shown on the Categories admin page.)
2. **Upload** → section **Import from inbox folder** → choose a default category → **Import inbox images**.
3. Imported files are moved to `content/inbox/_imported/` (a safe backup, never deleted).

## 3. Replace a wallpaper's image (keeps the same link)
1. **Wallpapers** → click the wallpaper → scroll to **Replace image**.
2. Choose the new file → **Replace image**.
3. Done. Same URL, title, description, category, tags and download count; new image, new thumbnail.

Want a *brand-new* wallpaper instead? Use **Upload**.

## 4. Edit details
**Wallpapers** → click one → change title, description, category, tags, **Published**, **Featured** → **Save changes**.
Shortcuts on the list: **Publish/Unpublish** and **Feature/Unfeature** buttons on each row.

## 5. Hide or delete
* **Hide (reversible):** untick *Published* (or press **Unpublish**). The wallpaper disappears from the site but you keep it.
* **Delete (permanent):** open it → **Delete wallpaper**, or tick several in the list → **Delete**. The images are removed from the server too.

## 6. Work with many at once
In **Wallpapers**, tick the boxes (or **Select all**), then use the toolbar: **Publish, Unpublish, Feature, Unfeature, Move** (to a category) or **Delete**.
Use the search/filter row to find items by title, tag, category or status (Published / Drafts).

## 7. Categories
**Categories** → **New category** → type a name (e.g. *Cyberpunk*) → **Create**.
* Change name, description or order (smaller number = earlier) → **Save**.
* A category appears on the public site once it contains a published wallpaper.
* To delete a category it must be empty: select its wallpapers → **Move** to another category → then **Delete**.

## 8. Thumbnails
Automatic. You never need to make them. To regenerate one, use **Replace image** with the same file.

## 9. Statistics and messages
* **Dashboard** shows total downloads, a 14-day chart and your most downloaded wallpapers.
* **Messages** shows everything sent through your Contact page. Press the email address to reply.

## 10. Good image tips
* Best results: **portrait phone sizes**, e.g. 1290 × 2796 or 2160 × 3840.
* Give each wallpaper a descriptive title and a sentence of description — it helps Google find it.
* Add 3–8 tags; visitors can search them.
* Keep a copy of your originals elsewhere. Also back up the database and the `content/` folder regularly.

## If something goes wrong
| You see | Do this |
| --- | --- |
| "Unsupported image type" / "not a readable image" | The file isn't a real JPG/PNG/WEBP/AVIF or is damaged. Re-export it. |
| "File is too large" | Compress it or ask your developer to raise `MAX_UPLOAD_MB`. |
| "Your session expired" | Reload the page and sign in again. |
| Grey placeholder instead of an image | The file is missing on the server — use **Replace image** to upload it again. |
