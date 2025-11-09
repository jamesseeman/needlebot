import { db } from "$lib/server/db/client";
import { albums } from "$lib/server/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  const allAlbums = await db.select().from(albums);
  console.log(allAlbums);
  return json(allAlbums);
}

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  console.log("Received data:", data);

  try {
    const results = [];

    for (const album of data) {
      // Handle the base64 upload image
      let imagePath = "";
      if (album.uploadImage && album.uploadImage.startsWith("data:image")) {
        // Generate a unique filename
        const timestamp = Date.now();
        const sanitizedArtist = album.artist.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const sanitizedAlbum = (album.album || album.title || "unknown").replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const filename = `${timestamp}_${sanitizedArtist}_${sanitizedAlbum}.jpg`;
        imagePath = `/uploads/${filename}`;

        // Extract base64 data and save to filesystem
        const base64Data = album.uploadImage.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filePath = path.join(process.cwd(), "static", "uploads", filename);

        await writeFile(filePath, buffer);
      }

      // Map the data to the database schema
      const dbRecord = {
        name: album.album || album.title || "",
        artist: album.artist || "",
        year: album.year ? parseInt(album.year) : 0,
        condition: album.condition || "",
        image: imagePath,
        genre: Array.isArray(album.genre) ? album.genre.join(", ") : album.genre || "",
        discogs_id: album.id?.toString() || null,
        discogs_uri: album.uri || null,
        discogs_img: album.cover_image || album.thumb || null,
        discogs_price: album.price?.toString() || null,
        discogs_low: album.low?.toString() || null,
        discogs_high: album.high?.toString() || null,
      };

      // Insert into database
      const inserted = await db.insert(albums).values(dbRecord).returning();
      results.push(inserted[0]);
    }

    return json({ success: true, albums: results });
  } catch (error) {
    console.error("Error saving albums:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return json({ success: false, error: errorMessage }, { status: 500 });
  }
};
