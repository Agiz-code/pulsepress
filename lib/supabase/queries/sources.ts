import { createServiceRoleClient } from "../service";
import type { SourceRow } from "../types";

export async function getActiveSources(): Promise<SourceRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("sources").select("*").eq("is_active", true).order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as SourceRow[];
}
