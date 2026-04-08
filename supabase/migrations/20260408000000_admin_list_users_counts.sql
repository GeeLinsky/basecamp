drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
returns table (
  id uuid,
  role text,
  created_at timestamptz,
  user_email text,
  user_display_name text,
  avatar_path text,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  food_entry_count bigint,
  food_favorite_count bigint,
  weight_entry_count bigint
)
language sql
security definer
stable
as $$
  select
    p.id,
    p.role,
    p.created_at,
    u.email::text as user_email,
    (u.raw_user_meta_data ->> 'display_name')::text as user_display_name,
    p.avatar_path,
    u.email_confirmed_at,
    u.last_sign_in_at,
    u.banned_until,
    (select count(*) from public.food_entries fe where fe.user_id = p.id) as food_entry_count,
    (select count(*) from public.food_favorites ff where ff.user_id = p.id) as food_favorite_count,
    (select count(*) from public.fuelup_weight fw where fw.user_id = p.id) as weight_entry_count
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at;
$$;
