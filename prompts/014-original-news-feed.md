# 014 — Original News Feed

## Goal

Add a page beside the existing Home / Top News experience where readers can browse all articles stored by the scraper, including articles that have not yet completed AI analysis. Present the publisher-attributed title, image, date, and the cleaned raw article text collected during scraping, with a direct link to each original publisher page.

## Skills and documentation read

- `AGENTS.md` — project architecture, read-only UI rule, and implementation approval workflow.
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — App Router page routing.
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — server/client boundaries.
- `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` — database reads from Server Components.
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` — image rendering.
- No additional skill was needed: this is a read-only presentation feature and does not modify scraping, analysis, auth, or the database schema.

## Existing code inspected

- `app/page.tsx` — existing homepage and shared `SiteHeader` usage.
- `components/site-header.tsx` — desktop/mobile primary navigation.
- `app/globals.css` — current Pulsepress palette, layout, and card styles.
- `lib/supabase/queries/articles.ts` — service-role article query; homepage currently filters on `analyzed_at`.
- `lib/supabase/types.ts` — article/source row types.
- `lib/scraping/parse.ts` — stored `raw_text` is cleaned plain text, not original HTML.
- `lib/supabase/service.ts` — server-only service-role client.
- `package.json` — scripts and installed UI dependencies.

## Decisions and assumptions

1. Create a public read-only route at `/original-news`, linked in the existing desktop and mobile navigation as `Original News`.
2. “As they appear on the original news site” means a readable presentation of stored title, image, publish date, publisher, and scraped plain-text body, with a link that opens the source URL. It does not mean embedding or proxying the live publisher site; the database does not store original HTML or per-site CSS.
3. Include all stored article rows, regardless of `analyzed_at`; do not change what appears on the existing analyzed Top News homepage.
4. Put the newest article in a featured region, then show the remaining articles as a scannable list/grid. Each entry should expose its full stored `raw_text` accessibly, using native disclosure where appropriate to keep the page manageable.
5. Interpret “confetti light under the highlighted news” as a restrained multicolor paper-light accent directly below the featured story. It must not obscure text, impair contrast, use a gradient/orb background, or shift layout when it animates. Respect reduced-motion preferences.
6. Use the current site shell, typography, muted canvas, dark ink, fine rules, red/blue accent colors, and compact card treatment. Avoid unrelated redesign.

## Files likely to change

- `components/site-header.tsx` — add the new navigation item for desktop and mobile.
- `lib/supabase/queries/articles.ts` — add a server-side read function for stored raw articles, without the analyzed-only filter.
- `app/original-news/page.tsx` — new server-rendered page and article presentation.
- `app/globals.css` — scoped styles for featured item, raw-feed list, full-text disclosure, empty state, and confetti-light accent.

## Implementation requirements

- Keep the page a Server Component and query Supabase only through the existing server-only service-role layer.
- Return typed article fields needed for presentation: id, title, original/canonical URL, image URL, published date, raw text, and source name.
- Order newest first and avoid the existing homepage's `analyzed_at IS NOT NULL` filter. Do not scrape, analyze, mutate rows, or add browser-side Supabase access.
- Avoid an arbitrary 12-article homepage limit. Read through stored rows in bounded database batches if needed so the feed can include all records without a single unbounded response.
- The featured item and article cards must link to their app/original-news URL appropriately; source links open a new tab with `rel="noopener noreferrer"`.
- Render raw text as escaped React text, split into readable paragraphs, and never inject scraped HTML.
- Handle empty results with a clear, styled empty state.
- Preserve mobile navigation behavior, semantic landmarks/headings, visible keyboard focus, image alternative text, and responsive layouts without horizontal overflow.
- Keep motion decorative and subtle; disable it for `prefers-reduced-motion: reduce`.

## Security requirements

- Do not expose Supabase service-role credentials or any other server secret.
- Do not render stored raw content as HTML or execute scripts from source pages.
- Do not add API routes or client-side access to scraping, AI analysis, or pipeline state.
- Keep original publisher links explicit and safely opened.

## Visual interpretation

- Use a restrained newsroom reading layout consistent with the existing Pulsepress site.
- Feature the newest scrape prominently with a stable landscape image, source/date eyebrow, readable title, short raw-text lead, and a clear publisher link.
- Place a small confetti-light treatment just below the featured content: a few crisp, low-opacity marks in red, cobalt, yellow, and teal, with fixed positioning/size and optional slow opacity/transform motion. It should read as a narrow editorial highlight, not as a floating card decoration or full-page background.
- Below it, use a responsive two/three-column article list where space allows, with image, publisher/date, title, a short body excerpt, a native “Show full scraped text” disclosure, and “Read original” link.
- At phone widths, use one column, wrap long titles, maintain comfortable text measure, and keep all controls in the viewport.
- Include a compact page title such as “Original News” and the total number of stored stories; do not add explanatory marketing copy.

## Acceptance criteria

- `/original-news` is reachable from both desktop and mobile primary navigation.
- It displays stored scraped articles even if `analyzed_at` is null.
- The latest article is visually highlighted and has the confetti-light accent beneath it.
- Every stored article is represented; readers can reveal its full stored raw text and open the corresponding publisher page.
- Existing `/` Top News behavior remains analyzed-only and visually unchanged.
- No raw HTML execution, client-side secret exposure, or scraping/analysis side effects are introduced.
- The page is keyboard accessible and responsive at desktop, tablet, and phone widths.

## Checks to run

```powershell
npm run typecheck
npm run lint
npm run build
```

## Manual test steps

1. Ensure at least one scraped row exists in `public.articles`; leave at least one with `analyzed_at` null.
2. Run `npm run dev` and visit `http://localhost:3000/original-news`.
3. Confirm unanalyzed and analyzed rows both appear, newest first; check the featured article and confetti-light accent.
4. Expand “Show full scraped text” on several entries and verify paragraphs render as text without executing or interpreting markup.
5. Open “Read original” and confirm it opens the stored publisher URL in a new tab.
6. Confirm `Original News` appears in desktop navigation and in the mobile menu; test keyboard focus and Escape behavior.
7. Check around 1440px, 768px, and 390px widths for card reflow, readable text, and no horizontal page overflow.
8. Revisit `/` and confirm its existing analyzed-only article feed remains unchanged.
