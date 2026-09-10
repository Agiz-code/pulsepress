# Company and Help Pages

## Goal

Create polished, responsive informational pages for Pulsepress:

- `/about`
- `/careers`
- `/press`
- `/contact`
- `/help`
- `/privacy`
- `/terms`

Replace the current footer placeholder anchors with real links to these pages.

## Skills read

- `AGENTS.md` - product scope, minimal responsive UI, Next.js conventions, and prompt-first workflow.
- Existing design implementation in `app/globals.css`, `app/page.tsx`, and `components/site-header.tsx`.

## Existing code inspected

- `app/layout.tsx` - global Poppins font, metadata, Clerk wrapper.
- `app/globals.css` - Pulsepress visual tokens, masthead, footer, responsive breakpoints, and card styles.
- `app/page.tsx` - current homepage brand/footer structure and placeholder footer links.
- `components/site-header.tsx` - primary navigation and responsive mobile navigation.

## Decisions and assumptions

1. Use Next.js App Router static pages with shared layout primitives, not a CMS or database.
2. Keep the existing Pulsepress visual language: editorial black/white canvas, red/blue framing accents, Poppins typography, restrained borders, and compact responsive spacing.
3. These pages are informational only. Contact uses a visible `mailto:` action and does not add an email backend or pretend to submit a form.
4. Careers shows a clear general application/contact path rather than inventing open roles.
5. Press provides a concise company description, coverage positioning, and press contact email; do not invent awards, user counts, funding, or named staff.
6. Privacy and Terms should be clearly labeled as starter policy copy requiring legal review before production use.
7. Add a reusable page shell and section styling only if it reduces duplication across these pages.

## Files likely to change

### Create

- `app/about/page.tsx`
- `app/careers/page.tsx`
- `app/press/page.tsx`
- `app/contact/page.tsx`
- `app/help/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- Optional shared `components/info-page.tsx` if it keeps the pages consistent without over-abstraction.

### Modify

- `app/page.tsx` - replace footer `#top` placeholders with real route links.
- `app/globals.css` - add focused informational-page styles and responsive rules.
- `app/layout.tsx` - only if shared metadata defaults need a small adjustment; page-specific metadata should live in each route.

## Implementation requirements

### Shared experience

- Every page has the shared Pulsepress header and footer treatment.
- Include a breadcrumb or compact back-to-news link where useful, using ordinary links and clear focus states.
- Use semantic `main`, `header`, `nav`, `section`, `article`, and `footer` elements.
- Provide page-specific `Metadata` exports with meaningful title and description.
- Do not add client-side JavaScript unless interaction genuinely requires it.
- Keep content width readable, with a strong page title, short lead, and scannable sections.
- Ensure links have visible hover/focus states and no text overflows on mobile.

### Page content

- About: what Pulsepress does, how AI-estimated framing analysis works, editorial principles, and a clear explanation that analysis is not objective truth.
- Careers: mission, working principles, what kinds of contributors fit, and a `mailto:` application/contact action.
- Press: press overview, approved product description, fact-checkable positioning, media assets/contact action, and no fabricated claims.
- Contact: separate editorial, support, and press contact destinations using mail links; include response-expectation copy without promising a specific SLA.
- Help Center: FAQ sections covering article analysis, AI-estimated framing, source coverage, account/access, and contacting support.
- Privacy Policy: starter policy covering information collected, use, service providers, retention, security, rights/contact, and a prominent legal-review note.
- Terms of Service: starter terms covering service use, content/analysis disclaimers, accounts, acceptable use, intellectual property, availability, changes, and contact, with a legal-review note.

### Footer navigation

Wire these destinations:

```text
Company: /about, /careers, /press, /contact
Help: /help, /privacy, /terms
```

Social links may remain placeholders only if they are not presented as active destinations; avoid dead `#top` links in the new informational pages.

## Security and content requirements

- Do not expose secrets or reference environment variables in page components.
- Do not collect form data without a backend implementation.
- Do not make factual claims about Pulsepress that are not supported by the repository.
- Mark Privacy and Terms as starter content requiring legal review.
- Keep all copy original and concise.

## Acceptance criteria

- All seven routes render successfully at their expected URLs.
- Footer links navigate to the correct routes from the homepage and informational pages.
- Each route has page-specific metadata and accessible headings.
- The pages are responsive at desktop, tablet, and mobile widths without overflow or overlapping text.
- Contact, careers, and press actions use valid `mailto:` links.
- No new client-side dependency is required.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. Manually open `/about`, `/careers`, `/press`, `/contact`, `/help`, `/privacy`, and `/terms`.
5. Verify footer navigation and mobile layout.