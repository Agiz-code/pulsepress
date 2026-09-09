import "server-only";

const OXYLABS_ENDPOINT = "https://realtime.oxylabs.io/v1/queries";

export async function scrapeUrl(url: string): Promise<string> {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing OXY_WSA_USERNAME or OXY_WSA_PASSWORD");
  }

  const response = await fetch(OXYLABS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: JSON.stringify({
      source: "universal",
      url,
      render: "html",
    }),
  });

  if (!response.ok) {
    throw new Error(`Oxylabs request failed for ${url}: ${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{ content?: string; status_code?: number; url?: string }>;
  };

  const content = payload.results?.[0]?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error(`Oxylabs returned empty content for ${url}`);
  }

  return content;
}
