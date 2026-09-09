# Oxylabs Scraping Pipeline

## Goal

Implement the Oxylabs-powered scraping pipeline for this Next.js app so it can:

- read active sources from Supabase
- fetch each source homepage through Oxylabs
- extract only article-card links from the homepage HTML
- reject non-article pages before detail scraping
- scrape detail pages, validate article content, and save valid articles
- write server-side logs and return a summary object from the API route
- protect action routes with the required admin secret header

This work is scoped to the scraping layer only and follows AGENTS.md architecture requirements.

## Skills read

- .agents/skills/oxylabs-web-scraper/SKILL.md
- .agents/skills/supabase-postgres-best-practices/SKILL.md
- AGENTS.md

## Existing code inspected

- app/layout.tsx — confirms there is a placeholder comment for the Oxylabs scraping pipeline
- lib/supabase/service.ts — server-only Supabase client factory and environment validation
- lib/supabase/queries/sources.ts — active-source query pattern
- lib/supabase/types.ts — database types for sources and articles
- supabase/schema.sql — current schema for sources, articles, article_analyses, logs
- package.json — project scripts and dependencies

## Decisions and assumptions

- Supabase remains the source of truth for active sources and article records.
- The app should not define a local JSON database for scraper state.
- Oxylabs calls will live in server-only modules and never be triggered from browser code.
- The scraping route will be a thin API handler that orchestrates Supabase reads, Oxylabs requests, HTML parsing, validation, and inserts.
- The parser should use a conservative allowlist of valid article URL patterns and reject obvious non-article pages instead of aggressively scraping everything.
- Because the repo is minimal and the task is focused on the scraping pipeline, we will avoid broader refactors and keep the change set limited to server-only modules and the API route.

## Files likely to change

- app/api/scrape/route.ts
- lib/scraping/oxylabs.ts
- lib/scraping/parse-homepage.ts
- lib/scraping/validate-article.ts
- lib/supabase/queries/sources.ts
- lib/supabase/types.ts
- supabase/schema.sql
- .env.example (if required for environment variables)

## Implementation requirements

### 1. Source loading

- Load all active sources from Supabase via the existing `sources` table.
- Use the stored `listing_url` only; do not hardcode source URLs.
- Respect the required selection behavior: all active sources by default and a configurable per-source limit.

### 2. Oxylabs scraping call

- Use the Oxylabs HTTP Basic Auth pattern described in the skill docs.
- Use `POST https://realtime.oxylabs.io/v1/queries` with `source: "universal"` and `url` equal to the source homepage.
- Keep credentials server-side and read them from environment variables only.
- Support a fallback result object with structured status and HTML.

### 3. Homepage link extraction

- Fetch the homepage HTML for each source.
- Parse the DOM with Cheerio.
- Extract only visible story/article card links from the homepage content.
- Reject obvious non-article pages before detail scraping, including category, tag, search, newsletter, menu, footer, and show/live pages.
- Normalize, dedupe, and filter URLs using safe URL handling.

### 4. Candidate URL filtering

- Keep only URLs that look like real article detail pages for the source.
- Reject homepage URLs and non-article URL patterns early.
- Use a stricter choice when uncertain.

### 5. Detail-page validation and insertion

- Fetch detail pages only for candidate URLs that pass the URL gate.
- Validate article pages required fields: meaningful title, meaningful body, published date, and image URL.
- Clean raw text before save so page noise (script/style/nav/footer text) is removed.
- Insert append-only records into `articles` without deleting or replacing existing records.
- Use the original URL for dedupe and canonical URL for tracking.

### 6. Logging and results

- Add console logging during the run for source selection, homepage fetch, candidate count, duplicates, detail pages processed, insert count, and final summary.
- Return a structured summary object with the required fields: status, sources checked, candidates found, candidates rejected, duplicates skipped, detail pages scraped, articles inserted, articles rejected, articles failed, total duration, and rejection reasons grouped by count.

### 7. Route contract

- Implement `POST /api/scrape`.
- Require the `x-biasly-admin-secret` header.
- Return 401 for missing or invalid secrets.
- Return the final scrape summary in the JSON response.

## Security requirements

- Never expose credentials or secrets to browser code.
- Keep `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, and `BIASLY_ADMIN_SECRET` server-only.
- Do not use the secret in query strings.
- Keep scraping and article processing server-side only.

## Acceptance criteria

- Active sources are loaded from Supabase.
- Homepage URLs are scraped via Oxylabs, not hardcoded.
- Only valid article detail pages are saved.
- Duplicate articles are avoided.
- Non-article page types are filtered before detail scrape.
- The route validates the admin secret header and returns 401 when missing or invalid.
- The API responds with a structured summary object.
- TypeScript compiles without errors.
- Lint passes.

## Checks to run

- npm run typecheck
- npm run lint
- npm run build (only if server modules or route wiring change the production build path)

## Exact manual test steps expected after implementation

1. Start the app with `npm run dev`.
2. Ensure `.env.local` includes the required server-side values for Supabase, Oxylabs, and `BIASLY_ADMIN_SECRET`.
3. Use a POST request to the route:

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -H "x-biasly-admin-secret: test-secret" \
  -d '{"sourceIds": [], "limit": 5}'
```

4. Confirm the terminal logs show selected sources, homepage fetch, candidate filtering, and insert counts.
5. Verify the response includes a summary object with the required fields.
6. Confirm invalid admin-secret requests return `401`.
7. Confirm the app does not expose any secret in browser code or client-side logs.

## Notes

The final implementation should remain minimal and align with the architecture described in AGENTS.md: a thin route, a server-only scraping module, and Supabase as the single source of truth.
