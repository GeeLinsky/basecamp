-- ============================================================
-- FUELUP GOALS (daily macro targets, one row per change date)
-- ============================================================
create table public.fuelup_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  effective_date date not null default current_date,
  fat_g integer not null check (fat_g >= 0),
  carbs_g integer not null check (carbs_g >= 0),
  protein_g integer not null check (protein_g >= 0),
  created_at timestamptz not null default now(),

  unique (user_id, effective_date)
);

create index fuelup_goals_user_date_idx on public.fuelup_goals (user_id, effective_date desc);

alter table public.fuelup_goals enable row level security;

create policy "Users can view their own goals"
  on public.fuelup_goals for select
  using (auth.uid() = user_id);

create policy "Users can create their own goals"
  on public.fuelup_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.fuelup_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.fuelup_goals for delete
  using (auth.uid() = user_id);
