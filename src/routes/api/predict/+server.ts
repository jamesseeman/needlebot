import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type;

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `Analyze this vinyl record image and provide the following information in JSON format ONLY. Do not include any text outside the JSON structure, including backticks.

{
  "artist": "Artist name",
  "album": "Album title",
  "year": "Release year (if visible)",
  "pressing": "Original/Reissue/Special Edition (if determinable)",
  "condition": "Mint/Near Mint/Very Good/Good/Fair/Poor",
  "conditionNotes": "Brief notes on visible wear, scratches, or damage",
  "coverCondition": "Condition of album cover",
  "confidence": "High/Medium/Low - how confident are you in this identification"
}

For the condition field, select one and only one of the available values. Leave specific notes in the conditionNotes field. Look for scratches, scuffs, warping, ring wear on covers, seam splits, etc. If you cannot identify the record, say so in the artist field. If you can't identify the year, leave the value blank.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return json({ error: 'Failed to analyze image' }, { status: 500 });
  }
};
