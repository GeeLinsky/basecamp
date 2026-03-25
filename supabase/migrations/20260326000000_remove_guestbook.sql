-- Remove realtime publication (only if table exists)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'guestbook_entries') then
    alter publication supabase_realtime drop table public.guestbook_entries;
  end if;
end;
$$;

-- Drop storage policies (safe to run even if they don't exist)
drop policy if exists "Users can view their own avatar" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;
drop policy if exists "Authenticated users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

-- Drop avatars bucket via API-safe approach
do $$
begin
  delete from storage.buckets where id = 'avatars';
exception when others then
  null;
end;
$$;

-- Drop guestbook table + policies
drop table if exists public.guestbook_entries;

-- Drop profile trigger + function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop profiles table + policies
drop table if exists public.profiles;
