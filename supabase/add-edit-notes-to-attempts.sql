-- Add edit_notes to attempts and allow updates (run in Supabase SQL Editor)
alter table public.attempts
add column if not exists edit_notes text not null default '';

drop policy if exists "Allow public update access on attempts" on public.attempts;
create policy "Allow public update access on attempts"
on public.attempts
for update
to anon, authenticated
using (true)
with check (true);