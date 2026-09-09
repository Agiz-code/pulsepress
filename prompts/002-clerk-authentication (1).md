# 004 — Home Page UI

## Task goal

Implement a **pixel-accurate** biasly home page from the attached screenshot, using the
design-system theme tokens established in step 001. UI only, with safe mock placeholder
data (the scrape/analysis pipeline and Supabase are not built yet).

## Matching plan step

**Step 04 — Home page UI.** Uses temporary safe placeholders per the step's allowance
("may use the available data layer or temporary safe placeholders if the data pipeline is
not ready").

## Skills read

- `.agents/skills/next-best-practices` (SKILL.md, font.md, image.md, rsc-boundaries.md) —
  RSC defaults, `next/font`, `next/image` usage.
- **Missing skills:** `.agents/skills/tailwind` and `.agents/skills/shadcn` (referenced by
  the plan) do not exist. Used official Tailwind v4 conventions + step-001 tokens.

## Decisions made (from user)

1. **Card content — follow the image exactly.** Card = image with circular "i" badge,
   `Category · Location`, title, a 3-segment bias meter (Left % / Center % / Right %, an
   aggregate source-distribution bar), and `N sources`. Do NOT add summary/sentiment/
   confidence to cards (those belong to the details page). Per AGENTS §9 the image is the
   visual source of truth; this overrides the differing field list in plan.md Step 04.
2. **Chrome — shared layout, visual-only.** `TopBar`, `SiteHeader` (nav + Login/Subscribe),
   and `SiteFooter` go in the root layout for reuse on the details page. Login/Subscribe
   and the Light/Dark/Auto theme toggle are **static / non-functional** (Clerk is Step 02;
   dark theme is out of scope — single light theme from step 001).

## Assumptions (small, reversible)

- **Bias meter model:** the home meter shows aggregate Left/Center/Right source-distribution
  percentages, which differs from the per-article `biasLabel`/`biasScore` in the AGENTS
  data model. For this UI step it is mock-only; mapping to real data is deferred to Step 06
  and flagged there.
- **Category bar** (the chips row under the header) is home-specific, so it lives in
  `app/page.tsx`, not the shared layout.
- **Icons** are hand-rolled inline SVGs (line style, 2px stroke, rounded caps per the
  design system) in `components/icons.tsx` — no new icon dependency.
- **Placeholder images** use `picsum.photos` (deterministic seed per card) via `next/image`;
  `next.config.ts` gets a `remotePatterns` entry for `picsum.photos`. Real `imageUrl`s
  replace these in the data-wiring step.
- **Card links** point to `/news/[id]` (details route is built in Step 05; links will 404
  until then — intentional, semantic-ready).
- Mock article content mirrors the headlines/categories/percentages visible in the
  screenshot as closely as practical.

## Files likely to be created / modified

Created:
- `lib/types.ts` — `HomeArticle` display type.
- `lib/mock-articles.ts` — 12 mock articles matching the screenshot.
- `components/icons.tsx` — inline SVG icons (menu, info, plus, chevron-right, chevron-down,
  globe, x/linkedin/instagram/youtube).
- `components/layout/top-bar.tsx` — black utility bar.
- `components/layout/site-header.tsx` — logo, nav, Subscribe/Login.
- `components/layout/site-footer.tsx` — black footer.
- `components/category-bar.tsx` — horizontally-scrolling category chips.
- `components/bias-meter.tsx` — 3-segment Left/Center/Right bar.
- `components/article-card.tsx` — single news card.

Modified:
- `app/layout.tsx` — wrap children with `TopBar` + `SiteHeader` + `SiteFooter`.
- `app/page.tsx` — `CategoryBar` + "Top News" heading + responsive card grid.
- `next.config.ts` — add `images.remotePatterns` for `picsum.photos`.

## Visual interpretation (top → bottom)

1. **Top utility bar** — full-width, bg `#0D0D0F`, light text. Left: `Browser Extension`,
   `Theme:` with `Light` (active/white) `Dark` `Auto` (secondary). Right: `Monday, June 1,
   2026`, `Set Location`, globe icon + `International Edition` + chevron-down. ~44px tall,
   caption/body-sm text.
2. **Header** — white bg, bottom border `#E5E7EB`, container 1280px, ~64px tall. Left:
   menu (hamburger) icon + `biasly` wordmark (bold) with small `News`. Nav: `Home` (active —
   primary text + short underline), `For You` (small red dot), `Local`, `Blindspot`
   (secondary). Right: `Subscribe` (primary/black button) + `Login` (outline button).
3. **Category bar** — white bg, bottom border, horizontal scroll. Leading `+` chip, then
   pill chips: `World Cup +`, `IPL +`, `Social Media +`, `Business & Markets +`,
   `Health & Medicine +`, `Soccer +`, `Artificial Intelligence +`, `Arsenal FC +`,
   `Extreme Weather and Disasters +`; trailing chevron-right. Chips: surface bg, border,
   rounded-full, body-sm.
4. **Main** — container 1280px, side margins 24px. `Top News` heading (H2, bold). Grid of
   12 article cards.
5. **Card** — white bg, border `#E5E7EB`, rounded-lg, overflow-hidden. Image (≈16:10,
   `object-cover`) with a circular translucent "i" badge top-right. Padding 16px. Meta:
   `Category` (primary) ` · ` `Location` (secondary), body-sm. Title: 16px semibold, ~2–3
   lines, snug leading. Bias meter (below). `N sources` (secondary, body-sm).
6. **Bias meter** — full-width bar, rounded, 3 flex segments sized by percentage:
   Left = bg `#B42318` white text `L NN%`; Center = bg `#E5E7EB` primary text `Center NN%`;
   Right = bg `#1D4ED8` white text `Right NN%`. Labels caption, medium weight.
7. **Footer** — full-width, bg `#0D0D0F`, light text, generous vertical padding. Left:
   `biasly News` + `Balanced news coverage powered by AI.` Columns: **Company** (About,
   Careers, Press, Contact), **Help** (Help Center, Guides, Privacy Policy, Terms of
   Service), **Connect** (X, LinkedIn, Instagram, YouTube icons). Bottom divider +
   `© 2026 Biasly News. All rights reserved.` (caption, secondary).

## Layout / spacing

- Centered container `max-width: 1280px` (`--container-biasly`), horizontal padding 24px
  (`px-6`).
- Card grid: `grid-cols-1` (mobile) → `sm:grid-cols-2` → `lg:grid-cols-3`, gap 24px
  (`gap-6`). Section vertical padding ~32px.
- Card internal padding 16px (`p-4`), gaps 8–12px between meta/title/meter/sources.

## Typography (step-001 tokens)

- Top bar / chips / meta / sources / footer links: `text-body-sm` (13px).
- Nav + buttons: `text-body-md` (14px), medium.
- Logo wordmark: ~`text-h3`/`text-h2` bold; `News` caption.
- "Top News": `text-h2` (24px) bold.
- Card title: `text-body-lg` (16px) `font-semibold`, `leading-snug`.
- Bias labels: `text-caption` (11px), medium.

## Color (step-001 tokens)

- Dark surfaces (top bar, footer): `bg-text-primary` (`#0D0D0F`) with white/`text-secondary`.
- Page bg white; cards `bg-bg-primary`; borders `border-border`/`divider`.
- Bias: `bg-bias-left`, `bg-bias-center`, `bg-bias-right`.
- Secondary text: `text-text-secondary`.

## Component requirements

- All components are RSC by default (no client interactivity needed; toggle/buttons are
  static). No `"use client"` unless required.
- Hand-rolled with Tailwind only (user decision). No shadcn, no icon library.
- `BiasMeter` takes `{ left: number; center: number; right: number }` and renders
  proportional segments (sum ≈ 100).
- `ArticleCard` takes a `HomeArticle` and links to `/news/${id}`.

## Responsive behavior

- Grid 1 → 2 → 3 columns by breakpoint.
- Header nav links hide below `md`; hamburger icon remains. Subscribe/Login remain.
- Top bar items wrap/hide gracefully on small screens (keep date/edition, allow secondary
  items to drop).
- Category bar always horizontally scrollable (`overflow-x-auto`, hidden scrollbar ok).
- Footer columns stack on mobile.

## Security requirements

- Pure presentation. No scraping, no analysis, no AI/Oxylabs/Supabase calls, no secrets.
- Home page must not trigger or mutate any pipeline state (AGENTS §20). Mock data is a
  static local import.

## Acceptance criteria

- Home page visually matches the screenshot (layout, spacing, type, colors, bias meter,
  chrome) within reasonable pixel tolerance.
- 12 cards render in a responsive 1/2/3-column grid.
- TopBar + Header + Footer render from the shared layout.
- No scraping/analysis/pipeline calls anywhere in the render path.
- `npm run lint` and `npm run build` pass.

## Checks to run

- `npm run lint`
- `npm run build`

## Plan update instructions

After implementation, update `plan.md`:
- Mark **Step 04 — Home page UI** complete; record files changed and checks run.
- Note the recorded assumptions (mock data, picsum placeholders, bias-meter model mismatch
  flagged for Step 06, `/news/[id]` links pending Step 05).
- Set current step / next recommended step to **Step 05 — News details page UI** (or
  remaining Step 01/02/03 foundation work, per existing plan ordering note).
