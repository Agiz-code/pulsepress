# Supabase Database and Data Access

## Goal
Implement the Supabase-backed data layer for Pulsepress so the home page and news detail page can read real article data from Supabase instead of relying only on mock content.

## Skills read
- .agents/skills/supabase
- node_modules/next/dist/docs/

## Existing code inspected
- app/page.tsx
- app/news/[id]/page.tsx
- lib/types.ts
- lib/mock-articles.ts
- .env.local

## Decisions and assumptions
- Supabase is the source of truth for public article reads.
- The app should use server-side queries and keep the UI server-rendered.
- If the database is empty, the UI should show a simple empty state instead of crashing.

## Files likely to change
- lib/supabase/service.ts
- lib/supabase/types.ts
- lib/supabase/queries/articles.ts
- lib/supabase/queries/sources.ts
- supabase/schema.sql
- app/page.tsx
- app/news/[id]/page.tsx
- .env.example
- tsconfig.json

## Implementation requirements
- Create a typed service-role Supabase client.
- Define SQL schema for sources, articles, article_analyses, and logs.
- Add server-side query helpers for reading analyzed articles and article details.
- Replace the mock-driven pages with Supabase-backed queries.

## Security requirements
- Keep service-role credentials server-only.
- Do not expose Supabase secrets to browser code.

## Acceptance criteria
- The app can read article rows from Supabase when available.
- The UI renders article cards and detail content from the database layer.
- The app degrades gracefully when the database has no rows.

## Checks to run
- npm run typecheck
- npm run lint
