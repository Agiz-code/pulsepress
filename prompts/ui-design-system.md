# Biasly UI design system

## Goal

Implement the visual system from `prompts-img/01-ui-design-system.png` in the Biasly home experience.

## Skills read

- Project `AGENTS.md` rules.
- Installed Next.js font documentation at `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`.

## Existing code inspected

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, and `package.json`.

## Decisions and assumptions

- The starter home page has no stored article data, so the system is demonstrated with static editorial sample cards.
- Existing routes, Clerk integration, and server/data boundaries remain unchanged.
- Poppins is loaded through `next/font/google`, as supported by the installed Next.js documentation.

## Files changed

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`

## Implementation requirements

- Define reusable color, spacing, radius, and shadow tokens based on the reference.
- Apply Poppins typography and editorial hierarchy.
- Create responsive buttons, chips, story cards, a semantic left/centre/right framing meter, header, and footer.
- Preserve keyboard focus treatments and responsive behaviour.

## Security requirements

- Do not expose secrets or add browser-side scraping, analysis, or database access.

## Acceptance criteria

- The home page consistently reflects the supplied near-white, black, slate, red, neutral, and blue visual system.
- Cards and framing indicators are responsive and accessible.

## Checks run

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev`.
2. Visit `http://localhost:3000` and compare the visual language with the supplied reference.
3. Test desktop and narrow mobile widths and tab through controls to verify responsive and focus states.
