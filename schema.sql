-- Run this whole file once in Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create type job_status as enum (
  'uploading','queued','extracting_audio','analyzing_scenes','writing_script',
  'generating_voice','creating_subtitles','rendering','completed','failed'
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  status job_status not null default 'uploading',
  progress int not null default 0 check (progress between 0 and 100),
  error text,
  source_path text,
  source_size bigint,
  rights_confirmed boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  script jsonb,
  output_path text,
  locked_by text,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_user_idx on public.jobs (user_id, created_at desc);
create index jobs_queue_idx on public.jobs (status) where status = 'queued';

create table public.job_events (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status job_status not null,
  message text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger jobs_touch before update on public.jobs
  for each row execute function public.touch_updated_at();

alter table public.jobs enable row level security;
alter table public.job_events enable row level security;

create policy "own jobs read" on public.jobs for select using (auth.uid() = user_id);
create policy "own jobs insert" on public.jobs for insert with check (auth.uid() = user_id and rights_confirmed = true);
create policy "own jobs delete" on public.jobs for delete using (auth.uid() = user_id);
-- Updates to jobs are made only by the server/worker with the service role.

create policy "own events read" on public.job_events for select
  using (exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid()));

-- Private storage buckets (folder name = user id)
insert into storage.buckets (id, name, public) values ('sources','sources',false), ('outputs','outputs',false)
on conflict (id) do nothing;

create policy "own sources read" on storage.objects for select
  using (bucket_id = 'sources' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own outputs read" on storage.objects for select
  using (bucket_id = 'outputs' and (storage.foldername(name))[1] = auth.uid()::text);
-- Writes to storage happen via server-issued signed upload URLs / service role.

-- Enable realtime progress updates
alter publication supabase_realtime add table public.jobs;
