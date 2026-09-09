## Automatic Pipeline

The hourly pipeline uses Oxylabs Scheduler for source homepages and Vercel Cron for processing completed results and pending analysis.

Before enabling it:

1. Run `supabase/schema.sql` in the Supabase SQL Editor, including the `oxylabs_schedules` and `oxylabs_schedule_runs` tables.
2. Configure server-side variables: `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `BIASLY_ADMIN_SECRET`, and `OPENAI_API_KEY`.
3. Deploy with `CRON_SECRET` configured by Vercel. The checked-in `vercel.json` calls `/api/cron/pipeline` at 15 minutes past every hour.
4. Create the Oxylabs schedules once:

	```powershell
	Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/oxylabs/schedules -Headers @{ "x-biasly-admin-secret" = $env:BIASLY_ADMIN_SECRET }
	```

For local verification, process completed jobs and invoke the cron chain directly:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/oxylabs/scheduled-results/process -Headers @{ "x-biasly-admin-secret" = $env:BIASLY_ADMIN_SECRET }
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/cron/pipeline
```

The Next.js server logs scheduler sync, completed-job claims, article insertion, analysis, and final pipeline summaries.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
