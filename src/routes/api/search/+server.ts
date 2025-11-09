import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const toDiscogsClassification = {
  mint: "Mint (M)",
  "near mint": "Near Mint (NM or M-)",
  "very good": "Very Good (VG)",
  good: "Good (G)",
  fair: "Fair (F)",
  poor: "Poor (P)",
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    // console.log("Received data:", data);

    // Get API credentials from environment variables
    const apiKey = process.env.DISCOGS_API_KEY;
    const apiSecret = process.env.DISCOGS_API_SECRET;
    const apiToken = process.env.DISCOGS_API_PERSONAL_TOKEN;

    if (!apiKey || !apiSecret || !apiToken) {
      return json(
        { error: "Discogs API credentials not configured" },
        { status: 500 }
      );
    }

    // Build search query parameters
    const searchParams = new URLSearchParams();

    // Add artist and album (release_title) to search
    if (data.artist && data.artist !== "Unknown") {
      searchParams.append("artist", data.artist);
    }

    if (data.album && data.album !== "Unknown") {
      searchParams.append("release_title", data.album);
    }

    // Add year if available
    if (data.year && data.year !== "Unknown") {
      searchParams.append("year", data.year);
    }

    // Set type to release
    searchParams.append("type", "release");

    searchParams.append("per_page", "5");

    const discogsUrl = `https://api.discogs.com/database/search?${searchParams.toString()}`;
    const response = await fetch(discogsUrl, {
      method: "GET",
      headers: {
        Authorization: `Discogs key=${apiKey}, secret=${apiSecret}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discogs API error:", errorText);
      return json(
        { error: `Discogs API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const discogsData = await response.json();

    // Check if we have results
    if (!discogsData.results || discogsData.results.length === 0) {
      return json(
        { error: "No results found for this album" },
        { status: 404 }
      );
    }

    const condition =
      toDiscogsClassification[data.condition.toLowerCase()] ?? null;

    await Promise.all(
      discogsData.results.map(async (release) => {
        const releasePriceSuggestion = await fetch(
          `https://api.discogs.com/marketplace/price_suggestions/${release.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Discogs token=${apiToken}`,
            },
          }
        ).then((res) => res.json());

        if (Object.keys(releasePriceSuggestion).length) {
          release.low = releasePriceSuggestion["Poor (P)"].value;
          release.high = releasePriceSuggestion["Mint (M)"].value;
          release.price = releasePriceSuggestion[condition]?.value;
        }
      })
    );

    return json(discogsData.results[0]);
  } catch (error) {
    console.error("Error searching Discogs:", error);
    return json({ error: "Failed to search Discogs" }, { status: 500 });
  }
};
