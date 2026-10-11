alter table public.zoneout_sessions
  drop constraint zoneout_sessions_minutes_check;

alter table public.zoneout_sessions
  rename column minutes to seconds;

update public.zoneout_sessions set seconds = seconds * 60;

alter table public.zoneout_sessions
  add constraint zoneout_sessions_seconds_check check (seconds > 0 and seconds <= 86400);
