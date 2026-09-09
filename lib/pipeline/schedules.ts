import "server-only";

import { createSchedule, listScheduleIds, setScheduleActive } from "../oxylabs/scheduler";
import { getActiveSources } from "../supabase/queries/sources";
import {
  getStoredOxylabsSchedules,
  updateOxylabsScheduleState,
  upsertOxylabsSchedule,
} from "../supabase/queries/oxylabs";

const DEFAULT_CRON = "0 * * * *";

function getScheduleCron(): string {
  return process.env.OXYLABS_SCHEDULE_CRON ?? DEFAULT_CRON;
}

function getScheduleEndTime(): string {
  const end = new Date();
  end.setUTCFullYear(end.getUTCFullYear() + 10);
  return end.toISOString().replace("T", " ").replace(".000Z", "");
}

export type ScheduleSyncSummary = {
  created: number;
  reused: number;
  deactivated: number;
  failed: number;
  errors: string[];
};

export async function syncOxylabsSchedules(): Promise<ScheduleSyncSummary> {
  const summary: ScheduleSyncSummary = { created: 0, reused: 0, deactivated: 0, failed: 0, errors: [] };
  const cron = getScheduleCron();
  const sources = await getActiveSources();
  const stored = await getStoredOxylabsSchedules();
  const storedBySource = new Map(stored.map((row) => [row.source_id, row]));
  const remoteIds = new Set(await listScheduleIds());
  const activeStoredIds = new Set<string>();

  for (const source of sources) {
    const previous = storedBySource.get(source.id);
    try {
      if (previous && remoteIds.has(previous.oxylabs_schedule_id)) {
        activeStoredIds.add(previous.oxylabs_schedule_id);
        summary.reused += 1;
        continue;
      }

      const created = await createSchedule({
        cron,
        homepageUrl: source.listing_url,
        endTime: getScheduleEndTime(),
      });
      await upsertOxylabsSchedule({
        sourceId: source.id,
        oxylabsScheduleId: created.scheduleId,
        cron,
        active: created.active,
        nextRunAt: created.nextRunAt,
      });
      activeStoredIds.add(created.scheduleId);
      summary.created += 1;
    } catch (error) {
      summary.failed += 1;
      summary.errors.push(`${source.name}: ${error instanceof Error ? error.message : "schedule sync failed"}`);
    }
  }

  const currentRemoteIds = await listScheduleIds();
  for (const remoteId of currentRemoteIds) {
    if (activeStoredIds.has(remoteId)) {
      continue;
    }

    try {
      await setScheduleActive(remoteId, false);
      const staleRow = stored.find((row) => row.oxylabs_schedule_id === remoteId);
      if (staleRow) {
        await updateOxylabsScheduleState(staleRow.id, false);
      }
      summary.deactivated += 1;
    } catch (error) {
      summary.failed += 1;
      summary.errors.push(`deactivate ${remoteId}: ${error instanceof Error ? error.message : "deactivation failed"}`);
    }
  }

  return summary;
}
