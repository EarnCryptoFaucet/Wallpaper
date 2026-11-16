import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Categories are fully managed from the admin dashboard. `id` is a stable URL slug. */
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One row per wallpaper. `id` never changes, so URLs survive edits and image replacement. */
export const wallpapers = pgTable(
  "wallpapers",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    originalFile: text("original_file").notNull(),
    thumbnailFile: text("thumbnail_file").notNull(),
    previewFile: text("preview_file").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    resolution: text("resolution").notNull(),
    aspectRatio: text("aspect_ratio").notNull(),
    format: text("format").notNull(),
    fileSize: integer("file_size").notNull().default(0),
    color: text("color").notNull().default("#120f20"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    isDemo: boolean("is_demo").notNull().default(false),
    downloads: integer("downloads").notNull().default(0),
    /** Bumped whenever the image is replaced; used to bust browser/CDN caches. */
    imageVersion: integer("image_version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("wallpapers_category_idx").on(table.categoryId),
    index("wallpapers_published_at_idx").on(table.publishedAt),
    index("wallpapers_downloads_idx").on(table.downloads),
  ],
);

/** One row per download, used for trending and dashboard statistics. */
export const downloadEvents = pgTable(
  "download_events",
  {
    id: serial("id").primaryKey(),
    wallpaperId: text("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("download_events_wallpaper_idx").on(table.wallpaperId),
    index("download_events_created_idx").on(table.createdAt),
  ],
);

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  emailed: boolean("emailed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type CategoryRow = typeof categories.$inferSelect;
export type WallpaperRow = typeof wallpapers.$inferSelect;
export type ContactMessageRow = typeof contactMessages.$inferSelect;
