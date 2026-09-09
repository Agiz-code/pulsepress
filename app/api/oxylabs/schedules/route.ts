import { NextRequest, NextResponse } from "next/server";

import { syncOxylabsSchedules } from "@/lib/pipeline/schedules";
import { getStoredOxylabsSchedules } from "@/lib/supabase/queries/oxylabs";

function isAuthorized(request: NextRequest): boolean {
  return request.headers.get("x-biasly-admin-secret") === process.env.BIASLY_ADMIN_SECRET && Boolean(process.env.BIASLY_ADMIN_SECRET);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getStoredOxylabsSchedules());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await syncOxylabsSchedules());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sync schedules" }, { status: 500 });
  }
}
