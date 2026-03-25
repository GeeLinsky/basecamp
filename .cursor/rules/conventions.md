# Conventions

- Use shadcn/ui components from `@/components/ui/`
- Use `toast` from `react-toastify` for notifications (not Sonner)
- Use `createClient()` from `@/lib/supabase/client` for Supabase access
- All clickable elements must have `cursor-pointer`
- Prefer `.maybeSingle()` over `.single()` for Supabase queries that may return no rows
- Use local date formatting for date strings: `new Date().getFullYear()` + `getMonth()` + `getDate()`, never `toISOString().split("T")[0]`
- Macro order everywhere: fat, carbs, protein
- Calories display as "cal" not "kcal"
- Display name comes from `user.user_metadata.display_name`
- Supabase migrations go in `supabase/migrations/` (same repo, not a separate backend repo)
- Push migrations with `supabase db push` from the project root, or apply via the Supabase MCP plugin
