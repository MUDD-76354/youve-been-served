-- Add optional notes column to jobs (run in Supabase SQL Editor)
alter table public.jobs
add column if not exists notes text not null default '';