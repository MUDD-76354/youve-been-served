-- Add client column to jobs (run in Supabase SQL Editor)
alter table public.jobs
add column if not exists client text not null default '';