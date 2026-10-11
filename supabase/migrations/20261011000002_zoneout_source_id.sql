alter table public.zoneout_sessions add column source_id text;

alter table public.zoneout_sessions
  add constraint zoneout_sessions_user_source_key unique (user_id, source_id);
