import { DISCOGS_API_KEY } from "$env/static/private";
import { integer, sqliteTable, text, numeric } from "drizzle-orm/sqlite-core";

export const albums = sqliteTable("albums", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  year: integer("year").notNull(),
  condition: text("condition").notNull(),
  image: text("image").notNull().default(""),
  genre: text("genre").notNull(),
  discogs_id: text("discogs_slug"),
  discogs_uri: text("discogs_uri"),
  discogs_img: text("discogs_img"),
  discogs_price: numeric("discogs_price"),
  discogs_low: numeric("discogs_log"),
  discogs_high: numeric("discogs_high"),
});
