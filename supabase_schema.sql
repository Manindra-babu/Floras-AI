-- ===================================================
-- Supabase Schema for Tree Census AI
-- Run this in your Supabase SQL Editor
-- ===================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. TREES TABLE
create table if not exists public.trees (
  id uuid primary key default gen_random_uuid(),
  species text,
  species_confidence float,
  latitude float not null,
  longitude float not null,
  current_status text default 'healthy', -- healthy | sick | cut_down
  photo_url text,
  note text,
  reported_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 2. STATUS HISTORY TABLE
create table if not exists public.tree_status_history (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references public.trees(id) on delete cascade,
  status text not null, -- healthy | sick | cut_down
  photo_url text,
  note text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 3. ADOPTIONS TABLE
create table if not exists public.tree_adoptions (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references public.trees(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (tree_id, user_id) -- A user can only adopt a specific tree once
);

-- Create Indexes for performance
create index if not exists idx_trees_status on public.trees(current_status);
create index if not exists idx_trees_geo on public.trees(latitude, longitude);
create index if not exists idx_history_tree_id on public.tree_status_history(tree_id);
create index if not exists idx_adoptions_user_id on public.tree_adoptions(user_id);

-- Enable Row Level Security (RLS)
alter table public.trees enable row level security;
alter table public.tree_status_history enable row level security;
alter table public.tree_adoptions enable row level security;

-- RLS Policies for trees
create policy "Allow public read access to trees" 
  on public.trees for select 
  using (true);

create policy "Allow authenticated inserts to trees" 
  on public.trees for insert 
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated updates to trees" 
  on public.trees for update 
  using (auth.role() = 'authenticated');

-- RLS Policies for tree_status_history
create policy "Allow public read access to status history" 
  on public.tree_status_history for select 
  using (true);

create policy "Allow authenticated inserts to status history" 
  on public.tree_status_history for insert 
  with check (auth.role() = 'authenticated');

-- RLS Policies for tree_adoptions
create policy "Allow public read access to adoptions" 
  on public.tree_adoptions for select 
  using (true);

create policy "Allow authenticated inserts to adoptions" 
  on public.tree_adoptions for insert 
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Allow authenticated deletes of own adoptions" 
  on public.tree_adoptions for delete 
  using (auth.role() = 'authenticated' and auth.uid() = user_id);


-- ===================================================
-- STORAGE BUCKETS SETUP NOTE
-- ===================================================
-- You must create a public storage bucket named "tree-photos" in your Supabase storage panel.
-- Configure it to allow public read access, and configure policies for upload:
--   - Allow authenticated users to upload files to "tree-photos"
--   - Policy: "Allow authenticated uploads" -> INSERT for authenticated role.
-- ===================================================
