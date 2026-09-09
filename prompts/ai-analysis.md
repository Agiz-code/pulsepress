Goal

- Implement the AI Article Analysis pipeline: a server-side `POST /api/analyze` endpoint that accepts a saved article (by id or raw text), runs an AI analysis (neutral summary, sentiment, bias percentages, framing notes, loaded terms, disclaimer), validates the output with Zod, and persists a new `article_analyses` row in Supabase linked to the article.

Skills Read

- .agents/skills/ai-sdk (Vercel AI SDK + OpenAI provider)
- .agents/skills/supabase
- .agents/skills/oxylabs-web-scraper (context only)
- node_modules/next/dist/docs/ (app routes and server runtime)

Existing Code Inspected

- lib/supabase/service.ts
- lib/supabase/types.ts
- lib/supabase/queries/articles.ts
- lib/types.ts
- AGENTS.md

Decisions & Assumptions

- Endpoint will be implemented as a server-side `POST` app route at `app/api/analyze/route.ts` following project conventions.
- The route will accept either `{ articleId: string }` (preferred) or `{ rawText: string, articleId?: string }` to analyze inline text.
- Use the Vercel AI SDK (OpenAI model) to produce structured JSON output. We'll call the model with a controlled system + user prompt and ask for JSON matching a Zod schema.
- We will NOT alter `supabase/schema.sql` or add embedding vector columns during this change; embedding storage will be added in a follow-up migration if requested.
- Use `createServiceRoleClient()` server-side with `SUPABASE_SERVICE_ROLE_KEY` to write `article_analyses` and update the parent article's `analyzed_at` timestamp.
- Use `zod` to validate model output; if the validation fails, log and return a 500 with details and save a minimal `article_analyses` row with `disclaimer` explaining the failure (optional).

Files Likely To Change

- prompts/ai-analysis.md (this prompt file)
- app/api/analyze/route.ts (new API route)
- lib/supabase/queries/articles.ts (add helper `insertArticleAnalysis` or similar)
- lib/supabase/types.ts (if small typings adjustments required)
- package.json (ensure `zod` and `@vercel/ai` dependencies exist; if missing, list install steps)

Implementation Requirements

- Implement `POST /api/analyze` as a server-only route using Next.js app route conventions.
- Accept JSON body: either `{ articleId: string }` or `{ rawText: string, articleId?: string }`.
- If `articleId` is present, load article `raw_text` from Supabase and refuse if not found.
- Build an AI prompt to produce a deterministic JSON object with fields matching the `ArticleAnalysisRow` columns: `summary`, `sentiment_score`, `sentiment_label`, `bias_score`, `bias_label`, `left_percentage`, `center_percentage`, `right_percentage`, `confidence`, `framing_notes`, `loaded_terms`, `disclaimer`, `model`.
- Validate the model JSON output using `zod` with strict types and ranges (percentages 0-100 sum close to 100, confidence 0-1, sentiment -1..1, bias -1..1).
- Insert a new row into `article_analyses` and update `articles.analyzed_at`.
- Return a succinct JSON success body with the inserted analysis ID.
- All secrets must be read server-side only. Do not return secrets in responses. Log minimal diagnostic information.

Security Requirements

- Use server-only `createServiceRoleClient()`; do not expose service keys to the browser.
- Require a server-side authorization guard if invoked from external cron or scheduler (not part of this change). For manual developer calls, no additional token is required beyond server role.
- Rate-limit or otherwise guard the endpoint externally (not implemented here).

Acceptance Criteria

- `prompts/ai-analysis.md` exists and is approved by the project owner.
- `POST /api/analyze` endpoint implemented and callable server-side.
- Model output validated with Zod; only valid outputs are saved.
- New `article_analyses` rows match `lib/supabase/types.ts` shape.
- `articles.analyzed_at` is set after successful insert.

Checks To Run

- `npm run typecheck` (TS types)
- `npm run lint`
- Manual: `curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"articleId":"<existing-article-id>"}'` after providing env vars.

Exact Manual Test Steps

1. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`.
2. Start the dev server: `npm run dev`.
3. Confirm an article exists in Supabase (use `getArticles` UI or inspect DB).
4. Call the endpoint with `{ "articleId": "<id>" }`.
5. Verify: `article_analyses` row inserted and `articles.analyzed_at` updated; response returns analysis id.

Notes / Follow-ups

- After this is approved and implemented, add optional embedding generation and storage once the schema is updated (`embedding vector(1536)`).
- Consider adding an admin UI to re-run analysis or view analysis logs.
