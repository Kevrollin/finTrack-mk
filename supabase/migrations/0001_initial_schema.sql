-- ============================================================
-- FinTrack Database Schema
-- Migration: 0001_initial_schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema public;

-- ============================================================
-- CATEGORIES TABLE
-- Predefined and user-custom spending categories
-- ============================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  icon        text not null default 'creditcard',
  color       text not null default '#6366f1',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.categories is 'Spending categories, both default (global) and user-created';

-- ============================================================
-- TRANSACTIONS TABLE
-- Core financial transaction records
-- ============================================================
create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,
  name            text not null,
  amount          numeric(12, 2) not null check (amount != 0),
  type            text not null check (type in ('expense', 'income')) default 'expense',
  note            text,
  transaction_date date not null default current_date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.transactions is 'Individual income and expense records per user';
comment on column public.transactions.amount is 'Always stored as positive; type column indicates direction';

-- ============================================================
-- BUDGETS TABLE
-- Monthly category budget limits
-- ============================================================
create table public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid not null references public.categories(id) on delete cascade,
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  month         integer not null check (month between 1 and 12),
  year          integer not null check (year >= 2000),
  created_at    timestamptz not null default now(),
  unique(user_id, category_id, month, year)
);

-- ============================================================
-- PROFILES TABLE
-- Public user metadata and admin access flag
-- ============================================================
create table public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public-facing user profile metadata and admin access flag';

comment on table public.budgets is 'Monthly spending limits per category per user';

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index idx_transactions_user_category on public.transactions(user_id, category_id);
create index idx_categories_user_id on public.categories(user_id);
create index idx_budgets_user_id on public.budgets(user_id);
create index idx_profiles_is_admin on public.profiles(is_admin);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.profiles enable row level security;

-- Categories: users can see default categories + their own
create policy "categories_select" on public.categories
  for select using (is_default = true or auth.uid() = user_id);

create policy "categories_insert" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "categories_update" on public.categories
  for update using (auth.uid() = user_id);

create policy "categories_delete" on public.categories
  for delete using (auth.uid() = user_id);

-- Transactions: users can only access their own
create policy "transactions_select" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update" on public.transactions
  for update using (auth.uid() = user_id);

create policy "transactions_delete" on public.transactions
  for delete using (auth.uid() = user_id);

-- Budgets: users can only access their own
create policy "budgets_select" on public.budgets
  for select using (auth.uid() = user_id);

create policy "budgets_insert" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "budgets_update" on public.budgets
  for update using (auth.uid() = user_id);

create policy "budgets_delete" on public.budgets
  for delete using (auth.uid() = user_id);

-- Profiles: users can see their own row; admins can see all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_select_admin" on public.profiles
  for select using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.is_admin = true
  ));

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

create policy "profiles_update_admin" on public.profiles
  for update using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.is_admin = true
  ));

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================
insert into public.categories (id, user_id, name, icon, color, is_default) values
  (gen_random_uuid(), null, 'Food & Dining',     'utensils', '#f97316', true),
  (gen_random_uuid(), null, 'Transport',          'carfront', '#3b82f6', true),
  (gen_random_uuid(), null, 'Shopping',           'shoppingbag', '#a855f7', true),
  (gen_random_uuid(), null, 'Entertainment',      'clapperboard', '#ec4899', true),
  (gen_random_uuid(), null, 'Health & Fitness',   'heartpulse', '#22c55e', true),
  (gen_random_uuid(), null, 'Housing & Rent',     'house', '#eab308', true),
  (gen_random_uuid(), null, 'Utilities',          'bolt', '#06b6d4', true),
  (gen_random_uuid(), null, 'Education',          'bookopen', '#8b5cf6', true),
  (gen_random_uuid(), null, 'Travel',             'plane', '#14b8a6', true),
  (gen_random_uuid(), null, 'Salary',             'briefcasebusiness', '#84cc16', true),
  (gen_random_uuid(), null, 'Freelance',          'laptop', '#f59e0b', true),
  (gen_random_uuid(), null, 'Investment',         'trendingup', '#10b981', true),
  (gen_random_uuid(), null, 'Other',              'package', '#6b7280', true);
