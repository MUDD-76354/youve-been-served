-- Profiles table for Supabase Auth users.
-- Run this script in the Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  server_name text not null,
  full_name text,
  role text not null default 'process_server',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_server_name_unique unique (server_name)
);

create index if not exists profiles_server_name_idx on public.profiles (server_name);
create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

drop policy if exists "Allow public read access on profiles" on public.profiles;
create policy "Allow public read access on profiles"
on public.profiles
for select
to anon, authenticated
using (true);