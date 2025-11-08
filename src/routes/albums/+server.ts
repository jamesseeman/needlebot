import { db } from "$lib/server/db/client";
import { albums } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";

export async function GET() {
    const allAlbums = await db.select().from(albums);
    console.log(allAlbums);
    return json(allAlbums);
}
