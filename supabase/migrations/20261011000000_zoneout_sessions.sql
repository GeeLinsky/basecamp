create table public.zoneout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  session_date date not null default current_date,
  minutes integer not null check (minutes > 0 and minutes <= 1440),
  note text,
  created_at timestamptz not null default now()
);

create index zoneout_sessions_user_date_idx on public.zoneout_sessions (user_id, session_date desc);

alter table public.zoneout_sessions enable row level security;

create policy "Users can view their own zoneout sessions"
  on public.zoneout_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own zoneout sessions"
  on public.zoneout_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own zoneout sessions"
  on public.zoneout_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own zoneout sessions"
  on public.zoneout_sessions for delete
  using (auth.uid() = user_id);
