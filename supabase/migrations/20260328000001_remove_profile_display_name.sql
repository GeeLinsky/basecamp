-- Remove display_name from profiles (use auth.users user_metadata instead)
alter table public.profiles drop column if exists display_name;

-- Update trigger to no longer set display_name
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;
