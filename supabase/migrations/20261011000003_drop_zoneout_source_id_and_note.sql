alter table public.zoneout_sessions drop constraint zoneout_sessions_user_source_key;

alter table public.zoneout_sessions drop column source_id;
alter table public.zoneout_sessions drop column note;
