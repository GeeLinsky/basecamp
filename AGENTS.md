# Basecamp

Personal website and dashboard for Garrett Polinsky (geelinsky.com).

## Architecture

- **Frontend**: React + Vite + TypeScript
- **UI**: shadcn/ui (new-york style) + Tailwind CSS
- **Backend**: Supabase (hosted, project ref: zlkrzfdgtxxpwnixjyyy)
- **Auth**: Supabase Auth with email/password, role-based access (admin/user)
- **Database**: Supabase Postgres with RLS
- **Storage**: Supabase Storage (private avatars bucket)
- **Edge Functions**: `supabase/functions/` — invite-user, delete-user, ban-user (deployed with `--no-verify-jwt`, auth handled in function code)
- **Migrations**: `supabase/` directory in this repo

## Structure

- `src/pages/HomePage.tsx` — public digital card with auth popover
- `src/layout/DashboardLayout.tsx` — authenticated dashboard with shadcn sidebar
- `src/pages/dashboard/` — dashboard pages (FuelUp, settings, users, component showcase)
- `supabase/migrations/` — Postgres migrations
- `supabase/functions/` — Supabase Edge Functions (Deno)
- `.agents/` — AI agent skills (Supabase Postgres best practices)

## Roles & Admin

- Role is stored on `profiles.role` (values: `admin`, `user`; default: `user`)
- A `prevent_role_change` trigger blocks client-side role changes
- `is_admin()` SQL helper is used in RLS policies
- `admin_list_users()` RPC joins profiles with `auth.users` for admin user listing
- Admin-only sidebar items use `adminOnly: true` in the nav config
- `useAdmin()` hook checks the current user's role via React Query
- Edge functions verify admin role server-side before performing actions

## Key Patterns

- Username (display name) is stored on `auth.users` user_metadata, not in the profiles table
- Avatar path is stored in `profiles.avatar_path`, served via signed URLs (private bucket)
- Use `createClient()` from `@/lib/supabase/client` for all Supabase queries
- Use `sonner` for all toast notifications
- Macro display order: fat, carbs, protein
- All interactive UI elements should have `cursor-pointer`
- Dates should use local time formatting, never `toISOString()` for date strings
- Every page component must include a `<Helmet>` with both `<title>` and `<meta name="description">`
