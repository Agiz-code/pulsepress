# Pulsepress homepage reference UI

## Goal

Replace the current landing-page-style homepage with the supplied dense news-feed interface, and rename all visible product branding and metadata from **Biasly** to **Pulsepress**.

## Skills read

- `AGENTS.md`
- `.agents/skills/clerk/SKILL.md` (the page retains Clerk's prebuilt authentication controls)
- Next.js App Router project structure and font documentation in `node_modules/next/dist/docs/`

## Existing code inspected

- `app/page.tsx` — current static marketing homepage and Clerk controls.
- `app/globals.css` — global homepage styles, cards, responsive breakpoints, and design tokens.
- `app/layout.tsx` — Poppins font configuration and `Biasly News` metadata.
- `package.json` — Next.js 16, React 19, Tailwind 4, and Clerk 7.
- `public/` — currently has no news photography assets.

## Decisions and assumptions

- This is a visual homepage implementation only: it must remain read-only and must not scrape, analyse, or mutate data from the browser.
- Until the Supabase article read layer is connected, use typed presentation data to construct the supplied 12-card layout. Keep it easy to replace with stored article records later.
- Use article imagery that is safe to render without adding a new image service or exposing credentials. Prefer local/static assets or standard `<img>` elements with accessible alt text if no local photographs are introduced.
- Preserve Clerk's existing sign-in / sign-up / account controls and restyle their triggers to fit the reference. The product name becomes `Pulsepress` everywhere in this UI and in document metadata.
- The date/location/theme controls, topic chips, social links, and card information icons are presentational unless an existing route or feature already provides their behaviour.

## Files likely to change

- `app/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `public/*` only if local image assets are needed

## Visual interpretation

- Use a warm off-white page background, very dark charcoal utility bar and footer, thin gray dividers, compact black typography, and muted gray topic pills.
- Build three stacked header rows: a narrow dark utility row; a white masthead with menu, **Pulsepress** wordmark, navigation, Subscribe, and Login; then a horizontally scrollable topic-chip rail.
- The main content is a centered, wide `Top News` section containing a three-column desktop grid of twelve uniform news cards. Each card has a 16:9 visual, compact category/region label, two-to-three-line headline, an info affordance, a left/center/right framing meter, and source count.
- Use red for the left segment, pale neutral gray for center, and rich blue for the right segment. Keep labels readable at narrow widths.
- Finish with a dark multi-column footer: Pulsepress wordmark/tagline, Company links, Help links, and compact social icons, followed by a slim copyright row.
- Match the reference's small type, tight vertical rhythm, thin borders, subtly rounded cards, roughly 24px desktop gutters, and generous whitespace around the grid without reproducing its original `biasly` brand.

## Implementation requirements

1. Replace the current hero, marketing cards, and principles content with the reference-oriented news homepage.
2. Create small typed helpers/components in `app/page.tsx` for the framing meter and article card; use semantic headings, landmarks, lists, buttons, and links.
3. Render all twelve reference-style news cards with varied visual treatments and data, ensuring their framing values total 100.
4. Rename visible logos, labels, accessibility names, footer copy, and `Metadata.title` / description to Pulsepress.
5. Retain the existing Poppins font setup unless a local, already-available alternative materially improves the match.
6. Make the topic row horizontally scrollable instead of clipping content.
7. At tablet width, retain a two-column grid where practical; at phone width, use a one-column grid, compact header controls, scrollable navigation/topics, and an easy-to-scan footer. Avoid horizontal page overflow.
8. Include visible focus states, adequate color contrast, meaningful image alt text, and icon buttons with accessible labels.
9. Do not add API routes, data writes, environmental variables, external dependencies, or browser-side calls to protected services.

## Security requirements

- Keep all UI data presentation-only.
- Do not expose server credentials, Supabase keys, Oxylabs credentials, OpenAI keys, or shared secrets.
- Keep Clerk integration on its supported prebuilt components; do not move secrets into client code.

## Acceptance criteria

- `/` visually reflects the supplied screenshot: compact dark utility bar, white news masthead, category rail, three-column Top News card grid, and dark multi-column footer.
- The word `biasly` is absent from the homepage and page metadata; `Pulsepress` is used instead.
- Each visible card includes image/visual, category context, title, framing meter, and source count.
- The layout is responsive, keyboard navigable, accessible, and free of viewport overflow at desktop and mobile sizes.
- Existing Clerk authentication controls still render and open their expected flows.

## Checks to run

```powershell
npm run typecheck
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev` from the project root and visit `http://localhost:3000`.
2. At a desktop viewport around 1440px wide, confirm all header rows, the 3-column Top News grid, framing meters, and footer align with the supplied reference.
3. At approximately 768px and 390px wide, confirm cards reflow to two and one columns respectively, the topic rail scrolls, and no horizontal page scrollbar appears.
4. Tab through the menu, topic chips, cards, footer links, and Clerk buttons; confirm a visible focus state and usable controls.
5. Click Login / Subscribe (or the equivalent Clerk triggers) and confirm the configured Clerk flow opens.
