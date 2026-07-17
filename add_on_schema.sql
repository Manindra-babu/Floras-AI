-- ===================================================
-- Supabase Schema Add-on for Tree Census AI
-- Run this in your Supabase SQL Editor
-- ===================================================

-- 1. Add verified column to trees table if not exists
alter table public.trees 
add column if not exists verified boolean default false;

-- 2. CREATE PUBLIC PROFILES TABLE FOR DISPLAY NAMES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

create policy "Allow authenticated inserts to own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Allow authenticated updates to own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 3. CREATE TREE CONFIRMATIONS TABLE
create table if not exists public.tree_confirmations (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references public.trees(id) on delete cascade,
  status_confirmed text not null, -- healthy | sick | cut_down
  confirmed_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (tree_id, status_confirmed, confirmed_by) -- prevent same user confirming same status twice
);

-- Create Index for performance
create index if not exists idx_confirmations_tree_id on public.tree_confirmations(tree_id);

-- Enable Row Level Security (RLS)
alter table public.tree_confirmations enable row level security;

-- RLS Policies for confirmations
create policy "Allow public read access to confirmations" 
  on public.tree_confirmations for select 
  using (true);

create policy "Allow authenticated inserts to confirmations" 
  on public.tree_confirmations for insert 
  with check (auth.role() = 'authenticated' and auth.uid() = confirmed_by);
