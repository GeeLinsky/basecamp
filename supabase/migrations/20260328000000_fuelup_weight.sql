create table public.fuelup_weight (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  effective_date date not null default current_date,
  weight_lbs numeric not null check (weight_lbs > 0),
  created_at timestamptz not null default now(),
  unique (user_id, effective_date)
);

create index fuelup_weight_user_date_idx on public.fuelup_weight (user_id, effective_date desc);

alter table public.fuelup_weight enable row level security;

create policy "Users can view their own weight"
  on public.fuelup_weight for select
  using (auth.uid() = user_id);

create policy "Users can create their own weight"
  on public.fuelup_weight for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weight"
  on public.fuelup_weight for update
  using (auth.uid() = user_id);

create policy "Users can delete their own weight"
  on public.fuelup_weight for delete
  using (auth.uid() = user_id);
