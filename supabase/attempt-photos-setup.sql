alter table public.attempts
add column if not exists photo_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attempts_job_id_fkey'
  ) then
    alter table public.attempts
    add constraint attempts_job_id_fkey
    foreign key (job_id) references public.jobs (id)
    on delete set null;
  end if;
exception
  when others then null;
end $$;

insert into storage.buckets (id, name, public)
values ('attempt-photos', 'attempt-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Allow public upload attempt photos" on storage.objects;
create policy "Allow public upload attempt photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'attempt-photos');

drop policy if exists "Allow public read attempt photos" on storage.objects;
create policy "Allow public read attempt photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'attempt-photos');