# Basecamp

Personal website and dashboard for Garrett Polinsky (geelinsky.com).

## Architecture

- **Frontend**: React + Vite + TypeScript
- **UI**: shadcn/ui (new-york style) + Tailwind CSS
- **Backend**: Supabase (hosted, project ref: zlkrzfdgtxxpwnixjyyy)
- **Auth**: Supabase Auth with email/password
- **Database**: Supabase Postgres with RLS
- **Storage**: Supabase Storage (private avatars bucket)
- **Migrations**: `supabase/` directory in this repo

## Structure

- `src/pages/HomePage.tsx` — public digital card with auth popover
- `src/layout/DashboardLayout.tsx` — authenticated dashboard with shadcn sidebar
- `src/pages/dashboard/` — dashboard pages (FuelUp, settings, component showcase)
- `supabase/migrations/` — Postgres migrations
- `.agents/` — AI agent skills (Supabase Postgres best practices)

## Key Patterns

- Display name is stored on `auth.users` user_metadata, not in the profiles table
- Avatar path is stored in `profiles.avatar_path`, served via signed URLs (private bucket)
- Use `createClient()` from `@/lib/supabase/client` for all Supabase queries
- Use `react-toastify` for all toast notifications
- Macro display order: fat, carbs, protein
- All interactive UI elements should have `cursor-pointer`
- Dates should use local time formatting, never `toISOString()` for date strings
