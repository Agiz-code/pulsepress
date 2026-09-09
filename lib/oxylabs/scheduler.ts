import "server-only";

const SCHEDULER_ENDPOINT = "https://data.oxylabs.io/v1/schedules";
const RESULT_ENDPOINT = "https://data.oxylabs.io/v1/queries";

export type OxylabsRunJob = {
  id: string;
  resultStatus: string;
};

export type OxylabsRun = {
  id: string;
  jobs: OxylabsRunJob[];
};

export type CreatedSchedule = {
  scheduleId: string;
  active: boolean;
  nextRunAt: string | null;
};

function getCredentials(): string {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;
  if (!username || !password) {
    throw new Error("Missing Oxylabs credentials");
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function getHeaders(): HeadersInit {
  return {
    Authorization: getCredentials(),
    "Content-Type": "application/json",
  };
}

async function readResponse(response: Response, operation: string): Promise<string> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Oxylabs ${operation} failed: ${response.status}`);
  }
  return text;
}

function extractFirstId(text: string, field: string): string {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*(\\d+)`));
  if (!match?.[1]) {
    throw new Error(`Oxylabs response did not include ${field}`);
  }
  return match[1];
}

function extractRunJobs(text: string): OxylabsRun[] {
  const parsed = JSON.parse(text) as { runs?: Array<{ jobs?: Array<{ result_status?: string }> }> };
  const runIdMatches = Array.from(text.matchAll(/"run_id"\s*:\s*(\d+)/g)).map((match) => match[1]);
  const jobArrays = Array.from(text.matchAll(/"jobs"\s*:\s*\[([\s\S]*?)\]/g));

  return (parsed.runs ?? []).map((run, runIndex) => {
    const rawJobs = jobArrays[runIndex]?.[1] ?? "";
    const jobIds = Array.from(rawJobs.matchAll(/"id"\s*:\s*(\d+)/g)).map((match) => match[1]);
    return {
      id: runIdMatches[runIndex] ?? String(runIndex),
      jobs: (run.jobs ?? []).map((job, jobIndex) => ({
        id: jobIds[jobIndex] ?? "",
        resultStatus: job.result_status ?? "",
      })).filter((job) => job.id.length > 0),
    };
  });
}

export async function createSchedule(input: {
  cron: string;
  homepageUrl: string;
  endTime: string;
}): Promise<CreatedSchedule> {
  const response = await fetch(SCHEDULER_ENDPOINT, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      cron: input.cron,
      items: [{ source: "universal", url: input.homepageUrl, render: "html" }],
      end_time: input.endTime,
    }),
  });
  const text = await readResponse(response, "schedule creation");
  const body = JSON.parse(text) as { active?: boolean; next_run_at?: string };
  return {
    scheduleId: extractFirstId(text, "schedule_id"),
    active: body.active ?? true,
    nextRunAt: body.next_run_at ?? null,
  };
}

export async function listScheduleIds(): Promise<string[]> {
  const response = await fetch(SCHEDULER_ENDPOINT, { headers: getHeaders() });
  const text = await readResponse(response, "schedule listing");
  return Array.from(text.matchAll(/\d{16,}/g)).map((match) => match[0]);
}

export async function listScheduleRuns(scheduleId: string): Promise<OxylabsRun[]> {
  const response = await fetch(`${SCHEDULER_ENDPOINT}/${encodeURIComponent(scheduleId)}/runs`, {
    headers: getHeaders(),
  });
  return extractRunJobs(await readResponse(response, "run listing"));
}

export async function fetchJobResult(jobId: string): Promise<string> {
  const response = await fetch(`${RESULT_ENDPOINT}/${encodeURIComponent(jobId)}`, {
    headers: getHeaders(),
  });
  const text = await readResponse(response, "job result");
  const body = JSON.parse(text) as {
    results?: Array<{ content?: string | Record<string, unknown> }>;
    content?: string;
  };
  const content = body.results?.[0]?.content ?? body.content;
  if (typeof content === "string" && content.trim()) {
    return content;
  }
  if (content && typeof content === "object") {
    return JSON.stringify(content);
  }
  throw new Error("Oxylabs job result was empty");
}

export async function setScheduleActive(scheduleId: string, active: boolean): Promise<void> {
  const response = await fetch(`${SCHEDULER_ENDPOINT}/${encodeURIComponent(scheduleId)}/state`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ active }),
  });
  await readResponse(response, "schedule state update");
}
