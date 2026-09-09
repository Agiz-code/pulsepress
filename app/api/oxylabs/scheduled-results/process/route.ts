import { NextRequest, NextResponse } from "next/server";

import { processScheduledResults } from "@/lib/pipeline/scheduled-results";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authorized = request.headers.get("x-biasly-admin-secret") === process.env.BIASLY_ADMIN_SECRET && Boolean(process.env.BIASLY_ADMIN_SECRET);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await processScheduledResults());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not process scheduled results" }, { status: 500 });
  }
}
