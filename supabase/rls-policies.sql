-- Row Level Security policies for the You've Been Served app.
-- Run this entire script in the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------

alter table public.jobs enable row level security;

drop policy if exists "Allow public read access on jobs" on public.jobs;
create policy "Allow public read access on jobs"
on public.jobs
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert access on jobs" on public.jobs;
create policy "Allow public insert access on jobs"
on public.jobs
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public update access on jobs" on public.jobs;
create policy "Allow public update access on jobs"
on public.jobs
for update
to anon, authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- attempts
-- ---------------------------------------------------------------------------

alter table public.attempts enable row level security;

drop policy if exists "Allow public read access on attempts" on public.attempts;
create policy "Allow public read access on attempts"
on public.attempts
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert access on attempts" on public.attempts;
create policy "Allow public insert access on attempts"
on public.attempts
for insert
to anon, authenticated
with check (true);