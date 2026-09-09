# Fix root hydration warning

## Goal

Prevent the Next.js hydration attribute warning when browser extensions or other pre-hydration browser tooling mutate root document attributes.

## Skills read

- Project `AGENTS.md` rules.

## Existing code inspected

- `app/layout.tsx`
- `app/page.tsx`
- `app/clerk-provider.tsx`

## Diagnosis and decision

- The home page uses static, deterministic values; it has no time, random, locale, or browser-only rendering branches.
- Clerk owns the interactive authentication controls, but it is correctly contained in a client provider.
- The reported generic attribute mismatch without a component diff is consistent with an extension mutating the root `<html>` or `<body>` before React hydrates.
- Add `suppressHydrationWarning` only to the root document elements. Do not apply it to page content or change Clerk behaviour, so real application hydration bugs remain detectable.

## Files likely to change

- `app/layout.tsx`

## Implementation requirements

- Add root-level hydration warning suppression to the document shell.
- Keep current language, font class, metadata, and Clerk provider intact.

## Security requirements

- No changes to auth configuration, environment variables, or client/server boundaries.

## Acceptance criteria

- Extension-injected root attributes no longer cause the console hydration warning.
- Normal SSR/client markup reconciliation remains in effect for the application content.

## Checks to run

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev`.
2. Open the app in the browser previously showing the warning and refresh.
3. Confirm the console no longer reports a hydration mismatch.
4. Test in a clean/incognito profile; if the warning was extension-driven, it should also be absent there.
