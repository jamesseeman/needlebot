import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const albums = sqliteTable("albums", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  year: integer("year").notNull(),
  condition: text("condition").notNull(),
  image: text("image").notNull().default(""),
  genre: text("genre").notNull(),
});