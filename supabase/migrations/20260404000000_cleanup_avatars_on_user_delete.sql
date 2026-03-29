create or replace function public.handle_profile_deleted()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = old.id::text;
  return old;
end;
$$;

create trigger on_profile_deleted
  before delete on public.profiles
  for each row execute function public.handle_profile_deleted();
