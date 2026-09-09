import { NextRequest, NextResponse } from "next/server";

import { runPendingAnalysis } from "@/lib/pipeline/analyze";
import { processScheduledResults } from "@/lib/pipeline/scheduled-results";
import { syncOxylabsSchedules } from "@/lib/pipeline/schedules";

export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const expected = process.env.CRON_SECRET;
  return Boolean(expected) && request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  let scheduleSync: Awaited<ReturnType<typeof syncOxylabsSchedules>> | null = null;
  let scheduledResults: Awaited<ReturnType<typeof processScheduledResults>> | null = null;
  let analysis: Awaited<ReturnType<typeof runPendingAnalysis>> | null = null;
  const errors: string[] = [];

  try {
    try {
      scheduleSync = await syncOxylabsSchedules();
    } catch (error) {
      errors.push(`schedule sync: ${error instanceof Error ? error.message : "failed"}`);
    }

    try {
      scheduledResults = await processScheduledResults();
    } catch (error) {
      errors.push(`scheduled results: ${error instanceof Error ? error.message : "failed"}`);
    }

    try {
      analysis = await runPendingAnalysis();
    } catch (error) {
      errors.push(`analysis: ${error instanceof Error ? error.message : "failed"}`);
    }

    const status = errors.length === 0 ? "success" : scheduleSync || scheduledResults || analysis ? "partial_success" : "failed";
    const result = { status, durationMs: Date.now() - startedAt, scheduleSync, scheduledResults, analysis, errors };
    console.log("[cron] pipeline final summary", result);
    return NextResponse.json(result, { status: status === "failed" ? 500 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron pipeline failed";
    return NextResponse.json({ status: "failed", error: message }, { status: 500 });
  }
}
