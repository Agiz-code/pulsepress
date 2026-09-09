create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  listing_url text not null unique,
  parser_strategy text,
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  original_url text not null unique,
  canonical_url text,
  title text not null,
  image_url text not null,
  published_at timestamptz not null,
  raw_text text not null,
  scraped_at timestamptz not null default now(),
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_analyses (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade unique,
  summary text not null,
  sentiment_score double precision not null,
  sentiment_label text not null,
  bias_score double precision not null,
  bias_label text not null,
  left_percentage double precision not null,
  center_percentage double precision not null,
  right_percentage double precision not null,
  embedding vector(1536),
  confidence double precision not null,
  framing_notes text not null,
  loaded_terms text[] not null default array[]::text[],
  disclaimer text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  scope text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.oxylabs_schedules (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null unique references public.sources(id) on delete cascade,
  oxylabs_schedule_id text not null unique,
  cron text not null,
  active boolean not null default true,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oxylabs_schedule_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.oxylabs_schedules(id) on delete cascade,
  oxylabs_run_id text,
  oxylabs_job_id text not null,
  status text not null default 'pending',
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, oxylabs_job_id)
);

create index if not exists articles_source_id_idx on public.articles(source_id);
create index if not exists articles_analyzed_at_idx on public.articles(analyzed_at);
create index if not exists article_analyses_article_id_idx on public.article_analyses(article_id);
create index if not exists article_analyses_embedding_idx on public.article_analyses using ivfflat (embedding vector_l2_ops) with (lists = 100);
create index if not exists oxylabs_schedule_runs_schedule_id_idx on public.oxylabs_schedule_runs(schedule_id);
create index if not exists oxylabs_schedule_runs_status_idx on public.oxylabs_schedule_runs(status);

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_analyses enable row level security;
alter table public.logs enable row level security;
alter table public.oxylabs_schedules enable row level security;
alter table public.oxylabs_schedule_runs enable row level security;

-- RLS Policies
-- NOTE: Postgres doesn't support CREATE POLICY IF NOT EXISTS,
-- so we DROP then CREATE.

drop policy if exists sources_select_public on public.sources;
create policy sources_select_public
on public.sources
for select
using (true);

drop policy if exists articles_select_public on public.articles;
create policy articles_select_public
on public.articles
for select
using (analyzed_at is not null);

drop policy if exists analyses_select_public on public.article_analyses;
create policy analyses_select_public
on public.article_analyses
for select
using (true);

drop policy if exists logs_no_public on public.logs;
create policy logs_no_public
on public.logs
for select
using (false);

drop policy if exists oxylabs_schedules_no_public on public.oxylabs_schedules;
create policy oxylabs_schedules_no_public
on public.oxylabs_schedules
for all
using (false)
with check (false);

drop policy if exists oxylabs_schedule_runs_no_public on public.oxylabs_schedule_runs;
create policy oxylabs_schedule_runs_no_public
on public.oxylabs_schedule_runs
for all
using (false)
with check (false);