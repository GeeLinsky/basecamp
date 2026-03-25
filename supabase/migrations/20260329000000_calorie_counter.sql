-- ============================================================
-- FOOD ENTRIES (daily calorie log)
-- ============================================================
create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  label text not null,
  fat_g numeric not null default 0 check (fat_g >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index food_entries_user_date_idx on public.food_entries (user_id, entry_date);

alter table public.food_entries enable row level security;

create policy "Users can view their own entries"
  on public.food_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own entries"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.food_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.food_entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FOOD PRESETS (saved templates)
-- ============================================================
create table public.food_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  label text not null,
  fat_g numeric not null default 0 check (fat_g >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  created_at timestamptz not null default now()
);

alter table public.food_presets enable row level security;

create policy "Users can view their own presets"
  on public.food_presets for select
  using (auth.uid() = user_id);

create policy "Users can create their own presets"
  on public.food_presets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presets"
  on public.food_presets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presets"
  on public.food_presets for delete
  using (auth.uid() = user_id);
