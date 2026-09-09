import { NextRequest, NextResponse } from "next/server";

import { runScrape } from "@/lib/scraping/scrape";

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get("x-biasly-admin-secret");
  const expectedSecret = process.env.BIASLY_ADMIN_SECRET;

  if (!expectedSecret || adminSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      sourceIds?: string[];
      limit?: number;
    };

    const result = await runScrape({
      sourceIds: Array.isArray(body.sourceIds) ? body.sourceIds : undefined,
      limit: typeof body.limit === "number" ? body.limit : 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
