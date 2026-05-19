-- ============================================================
-- Migration: 0002_admin_profiles
-- Adds a `profiles` table (admin flag) + helper, RLS policies, and trigger
-- ============================================================

-- Create profiles table if it doesn't already exist
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public-facing user profile metadata and admin access flag';

-- Index for admin queries
do $$ begin
  if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where c.relname = 'idx_profiles_is_admin') then
    create index idx_profiles_is_admin on public.profiles(is_admin);
  end if;
end$$;

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Helper: returns true when the current auth user is an admin
create or replace function public.is_admin_user()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and is_admin = true
  );
$$;

-- Policies: allow users to read/update their own profile, allow admins to read/update all
-- Drop any prior policies to ensure idempotency when this migration is applied more than once
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin_user());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = user_id);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin_user());

-- Trigger helper: create/refresh profile row when an auth.users row is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
  return new;
end;
$$;

-- Attach trigger to auth.users (drop if exists first)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Done
