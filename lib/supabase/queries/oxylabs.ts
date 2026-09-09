import "server-only";

import { createServiceRoleClient } from "../service";
import type { OxylabsScheduleRow, OxylabsScheduleRunRow } from "../types";

export async function getStoredOxylabsSchedules(): Promise<OxylabsScheduleRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("oxylabs_schedules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OxylabsScheduleRow[];
}

export async function upsertOxylabsSchedule(input: {
  sourceId: string;
  oxylabsScheduleId: string;
  cron: string;
  active?: boolean;
  nextRunAt?: string | null;
}): Promise<OxylabsScheduleRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("oxylabs_schedules")
    .upsert(
      {
        source_id: input.sourceId,
        oxylabs_schedule_id: input.oxylabsScheduleId,
        cron: input.cron,
        active: input.active ?? true,
        next_run_at: input.nextRunAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "source_id" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as OxylabsScheduleRow;
}

export async function updateOxylabsScheduleState(id: string, active: boolean): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("oxylabs_schedules")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function claimOxylabsScheduleRun(input: {
  scheduleId: string;
  oxylabsRunId?: string | null;
  oxylabsJobId: string;
  metadata?: Record<string, unknown>;
}): Promise<OxylabsScheduleRunRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("oxylabs_schedule_runs")
    .insert({
      schedule_id: input.scheduleId,
      oxylabs_run_id: input.oxylabsRunId ?? null,
      oxylabs_job_id: input.oxylabsJobId,
      status: "processing",
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (!error) {
    return data as OxylabsScheduleRunRow;
  }

  if (error.code === "23505") {
    return null;
  }

  throw error;
}

export async function completeOxylabsScheduleRun(id: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("oxylabs_schedule_runs")
    .update({
      status: "completed",
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function failOxylabsScheduleRun(id: string, errorMessage: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("oxylabs_schedule_runs")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
