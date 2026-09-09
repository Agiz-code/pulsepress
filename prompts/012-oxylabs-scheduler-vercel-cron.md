# Oxylabs Scheduler and Vercel Cron

## Goal

Implement automatic hourly news processing using Oxylabs Scheduler for source homepage
scraping and a protected Vercel Cron route that processes completed Oxylabs results and
runs pending AI analysis.

## Skills read

- `.agents/skills/oxylabs-web-scraper/SKILL.md` - Oxylabs authentication and scraping API.
- `AGENTS.md` - scheduler, cron, persistence, security, and shared pipeline requirements.
- Live Oxylabs Scheduler documentation at
  `https://developers.oxylabs.io/products/web-scraper-api/features/scheduler` - current
  endpoint paths, request fields, `/runs` response shape, and schedule state control.

## Existing code inspected

- `lib/scraping/oxylabs.ts` - server-only realtime Oxylabs fetch using Basic Auth.
- `lib/scraping/scrape.ts` - manual homepage-to-article pipeline, dedupe, validation,
  insertion, and run logging.
- `lib/scraping/parse.ts` - candidate URL extraction and article parsing/validation.
- `app/api/scrape/route.ts` - existing admin-secret action route.
- `app/api/analyze/route.ts` - existing article analysis endpoint, which currently handles
  only one article per request and must be callable by the cron orchestration without an
  internal browser request.
- `lib/supabase/queries/articles.ts` - article insertion and analysis persistence.
- `lib/supabase/queries/sources.ts` - active source loading.
- `supabase/schema.sql` and `lib/supabase/types.ts` - current persistence model.
- `package.json` and `next.config.ts` - available scripts and Next.js configuration.

## Decisions and assumptions

1. Oxylabs Scheduler creates one schedule per active source homepage, using the source's
   stored `listing_url`; no source URL is hardcoded.
2. Oxylabs schedules run hourly with cron expression `15 * * * *` unless a configurable
   server-only `OXYLABS_SCHEDULE_CRON` value is supplied. Vercel Cron runs at minute 15
   after the hour using `15 * * * *`, giving Oxylabs time to finish its jobs; document and
   keep these timing values configurable where the platform requires it.
3. Scheduler IDs and job IDs are 64-bit integers. Preserve them as strings by extracting
   digit sequences from raw response text before JSON parsing; never round-trip them
   through JavaScript `number` values.
4. Scheduler state is persisted in `oxylabs_schedules`, and processed run/job state is
   persisted in `oxylabs_schedule_runs` so cron invocations are idempotent.
5. Scheduler homepage results must feed the same candidate extraction, URL filtering,
   detail scraping, validation, dedupe, insertion, and logging behavior as manual scrape.
   Refactor the shared pipeline to accept a homepage HTML provider rather than copying it.
6. The cron route runs scheduled-result processing first, then pending analysis even if
   scheduled processing fails. It calls shared server-side functions directly rather than
   making an internal HTTP request to the admin-protected analysis route.
7. The cron route is protected by `CRON_SECRET` in deployed environments. For local
   development, skip the check as required by `AGENTS.md`; never use or expose
   `BIASLY_ADMIN_SECRET` for cron protection.
8. Scheduler management and manual processing routes require
   `x-biasly-admin-secret` and never expose Oxylabs credentials or secrets.
9. Creating or synchronizing schedules must deactivate Oxylabs schedules that are no
   longer represented by active database sources, preventing orphaned billable jobs.
10. All server-only Oxylabs and Supabase service-role modules must remain outside browser
    bundles.

## Files likely to change

### Create

- `lib/oxylabs/scheduler.ts` - authenticated Scheduler API client, raw-response ID
  preservation, schedule creation/listing/state changes, run listing, and result fetch.
- `lib/pipeline/scheduled-results.ts` - completed-run selection, idempotency tracking, and
  shared homepage-result processing.
- `app/api/oxylabs/schedules/route.ts` - `POST` sync/create schedules and `GET` stored
  schedules.
- `app/api/oxylabs/scheduled-results/process/route.ts` - admin-protected manual processing.
- `app/api/cron/pipeline/route.ts` - protected hourly orchestration endpoint.
- `vercel.json` - Vercel Cron registration for `/api/cron/pipeline`.

### Modify

- `lib/scraping/scrape.ts` - extract reusable source homepage processing and allow supplied
  homepage HTML while preserving manual behavior and summary logging.
- `lib/supabase/types.ts` - add typed schedule and schedule-run rows.
- `supabase/schema.sql` - add `oxylabs_schedules` and `oxylabs_schedule_runs` tables,
  indexes, and RLS policies consistent with server-role-only writes.
- `lib/supabase/queries/` - add focused schedule/run persistence helpers, including an
  atomic/idempotent processed-job claim or unique constraint.
- `lib/pipeline/analyze.ts` or the current analysis implementation - extract a reusable
  pending-analysis runner so cron can process all pending valid articles without an HTTP
  self-call; preserve the existing public `POST /api/analyze` behavior.
- `.env.example` if present, or project documentation if it is absent - document only
  server-side scheduler variables and the Vercel Cron setup.

## Implementation requirements

### Scheduler API client

- Use `https://data.oxylabs.io/v1/schedules` with Basic Auth from
  `OXY_WSA_USERNAME` and `OXY_WSA_PASSWORD`.
- `POST /v1/schedules` payload must contain the configured cron expression, one item with
  `{ source: "universal", url: source.listing_url, render: "html" }` per source schedule,
  and an end time sufficiently far in the future if the API requires one.
- `GET /v1/schedules` lists all remote schedule IDs.
- `GET /v1/schedules/{id}/runs` is the only source of run status. Filter jobs to
  `result_status === "done"`; do not process pending or faulted jobs.
- Fetch each completed job result through the documented Push-Pull result endpoint,
  preserving the job ID as a string.
- `PUT /v1/schedules/{id}/state` with `{ active: false }` deactivates orphan schedules.
- Throw useful server-side errors without including credentials.

### Persistence

Add tables with fields sufficient to map active source IDs to remote schedule IDs and to
record processed run/job IDs, statuses, timestamps, and metadata. Use text columns for
remote 64-bit IDs, unique constraints for `(schedule_id, job_id)`, and indexes for source,
schedule, status, and created time. Keep `supabase/schema.sql` as the source reference and
include the SQL needed for the user to run in the Supabase SQL Editor.

### Schedule sync route

- `POST /api/oxylabs/schedules` requires the admin header.
- Load active sources from Supabase, create or reuse schedules, persist returned IDs, then
  list remote schedules and deactivate any remote ID not stored for a current active source.
- Return a typed summary of created, reused, deactivated, and failed schedules.
- `GET /api/oxylabs/schedules` requires the admin header and returns stored rows only.

### Scheduled result processing

- `POST /api/oxylabs/scheduled-results/process` requires the admin header.
- Load stored schedules, query `/runs`, choose completed jobs, skip jobs already claimed or
  completed in `oxylabs_schedule_runs`, fetch homepage HTML, and process it through the
  shared scrape pipeline.
- Record each job's pending/processing/completed/failed state and error metadata without
  leaking secrets.
- Preserve append-only article storage, URL existence batching (maximum 15 URLs per
  Supabase `.in()` call), article validation, per-source logging, and final summaries.

### Cron pipeline

- `GET /api/cron/pipeline` accepts Vercel's cron request.
- In production, require `Authorization: Bearer ${CRON_SECRET}` (or the exact existing
  project convention) and return `401` on missing or invalid values. Skip the check only
  when running in local development as specified by `AGENTS.md`.
- Run scheduled result processing and then the shared pending-analysis runner. If scraping
  fails, still attempt analysis and return a combined status with both errors/summaries.
- Export a suitable `maxDuration` for the combined work and log start, each stage result,
  and final summary.
- Register the cron path and hourly schedule in `vercel.json`.

### Analysis integration

- Do not call `/api/analyze` over HTTP from the server.
- Extract or reuse a server-side function that finds articles with no analysis row (and
  backfills missing embeddings as applicable), processes configurable batches, and returns
  analyzed/skipped/failed counts.
- Keep the existing admin route as a thin authenticated adapter.

## Security requirements

- Never send `SUPABASE_SERVICE_ROLE_KEY`, Oxylabs credentials, OpenAI credentials,
  `BIASLY_ADMIN_SECRET`, or `CRON_SECRET` to client code.
- Keep scheduler clients and pipeline modules `server-only`.
- Validate request bodies and cap configurable limits to prevent unbounded cron work.
- Do not place secrets in URLs, logs, response bodies, or persisted metadata.
- Do not permit browser callers to trigger scheduler mutations or scheduled-result
  processing without the admin secret.

## Acceptance criteria

- Active source homepages can be synchronized into one remote Oxylabs schedule per source.
- Repeated syncs do not create duplicate schedules for unchanged sources.
- Removed/inactive source schedules are deactivated remotely.
- Scheduler IDs and job IDs remain exact strings, including values above
  `Number.MAX_SAFE_INTEGER`.
- Only completed jobs from `/runs` are fetched and processed.
- Reprocessing the same completed job does not insert duplicate articles.
- Manual processing and scheduled processing share candidate filtering, article validation,
  dedupe, persistence, and logging behavior.
- The cron route chains scheduled processing and analysis, and analysis still runs when
  scheduled processing reports an error.
- Unauthorized admin and cron requests return `401`.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- Supabase schema/types and required Dashboard SQL are clearly documented.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. Use mocked scheduler responses or a safe test account to verify exact large-ID
   preservation, `/runs` filtering, orphan deactivation, and idempotent job processing.

## Exact manual test steps after implementation

1. Run the schema migration in Supabase SQL Editor and confirm the schedule tables exist.
2. Start the app with `npm run dev`.
3. Create/sync schedules:

   ```powershell
   Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/oxylabs/schedules -Headers @{ "x-biasly-admin-secret" = $env:BIASLY_ADMIN_SECRET }
   ```

4. Inspect stored schedules:

   ```powershell
   Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/oxylabs/schedules -Headers @{ "x-biasly-admin-secret" = $env:BIASLY_ADMIN_SECRET }
   ```

5. Process completed scheduler results manually:

   ```powershell
   Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/oxylabs/scheduled-results/process -Headers @{ "x-biasly-admin-secret" = $env:BIASLY_ADMIN_SECRET }
   ```

6. In local development, invoke the cron endpoint:

   ```powershell
   Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/cron/pipeline
   ```

7. Watch the Next.js terminal for scheduler, scrape, analysis, skip, failure, and final
   summary logs. Verify new articles are not visible until valid analysis is saved.
8. In Vercel, verify the cron entry is deployed and inspect the function logs after an
   hourly run.