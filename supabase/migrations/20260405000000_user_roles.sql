-- ============================================================
-- USER ROLES
-- ============================================================

-- Add role column with check constraint
alter table public.profiles
  add column role text not null default 'user'
  check (role in ('admin', 'user'));

-- Helper to check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Prevent users from changing their own role via client updates
create or replace function public.prevent_role_change()
returns trigger
language plpgsql as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Cannot change role';
  end if;
  return new;
end;
$$;

create trigger protect_role
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Admins can view all avatars
create policy "Admins can view all avatars"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and public.is_admin()
  );

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- RPC for admins to list users with email/display_name from auth.users
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
  banned_until timestamptz
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
    u.banned_until
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at;
$$;
