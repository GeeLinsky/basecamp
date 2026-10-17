create table public.steepup_climbs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  vertical_feet integer not null check (vertical_feet > 0 and vertical_feet <= 100000),
  miles numeric(6, 2) not null check (miles > 0 and miles <= 1000),
  created_at timestamptz not null default now()
);

create index steepup_climbs_user_idx on public.steepup_climbs (user_id, created_at desc);

alter table public.steepup_climbs enable row level security;

create policy "Users can view their own steepup climbs"
  on public.steepup_climbs for select
  using (auth.uid() = user_id);

create policy "Users can create their own steepup climbs"
  on public.steepup_climbs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own steepup climbs"
  on public.steepup_climbs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own steepup climbs"
  on public.steepup_climbs for delete
  using (auth.uid() = user_id);
