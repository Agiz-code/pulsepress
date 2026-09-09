import "server-only";

import { fetchJobResult, listScheduleRuns } from "../oxylabs/scheduler";
import { getStoredOxylabsSchedules, claimOxylabsScheduleRun, completeOxylabsScheduleRun, failOxylabsScheduleRun } from "../supabase/queries/oxylabs";
import { runScrape, type ScrapeSummary } from "../scraping/scrape";

export type ScheduledResultsSummary = {
  status: "success" | "partial_success" | "failed";
  schedulesChecked: number;
  completedJobsFound: number;
  jobsProcessed: number;
  jobsSkipped: number;
  articlesInserted: number;
  failures: number;
  scrapeSummaries: ScrapeSummary[];
  errors: string[];
};

export async function processScheduledResults(): Promise<ScheduledResultsSummary> {
  const summary: ScheduledResultsSummary = {
    status: "success",
    schedulesChecked: 0,
    completedJobsFound: 0,
    jobsProcessed: 0,
    jobsSkipped: 0,
    articlesInserted: 0,
    failures: 0,
    scrapeSummaries: [],
    errors: [],
  };
  const schedules = await getStoredOxylabsSchedules();
  summary.schedulesChecked = schedules.length;

  for (const schedule of schedules.filter((row) => row.active)) {
    try {
      const runs = await listScheduleRuns(schedule.oxylabs_schedule_id);
      for (const run of runs) {
        for (const job of run.jobs.filter((item) => item.resultStatus === "done")) {
          summary.completedJobsFound += 1;
          const claim = await claimOxylabsScheduleRun({
            scheduleId: schedule.id,
            oxylabsRunId: run.id,
            oxylabsJobId: job.id,
            metadata: { resultStatus: job.resultStatus },
          });
          if (!claim) {
            summary.jobsSkipped += 1;
            continue;
          }

          try {
            const homepageHtml = await fetchJobResult(job.id);
            const scrapeSummary = await runScrape({
              sourceIds: [schedule.source_id],
              homepageHtmlBySourceId: new Map([[schedule.source_id, homepageHtml]]),
            });
            summary.scrapeSummaries.push(scrapeSummary);
            summary.articlesInserted += scrapeSummary.articlesInserted;
            summary.jobsProcessed += 1;
            await completeOxylabsScheduleRun(claim.id);
          } catch (error) {
            summary.failures += 1;
            const message = error instanceof Error ? error.message : "scheduled job failed";
            summary.errors.push(`${job.id}: ${message}`);
            await failOxylabsScheduleRun(claim.id, message);
          }
        }
      }
    } catch (error) {
      summary.failures += 1;
      summary.errors.push(`${schedule.oxylabs_schedule_id}: ${error instanceof Error ? error.message : "schedule run lookup failed"}`);
    }
  }

  summary.status = summary.failures === 0 ? "success" : summary.jobsProcessed > 0 ? "partial_success" : "failed";
  console.log("[scheduled-results] final summary", summary);
  return summary;
}
