ALTER TABLE public.food_entries ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

UPDATE public.food_entries SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, entry_date ORDER BY created_at) AS rn
  FROM public.food_entries
) sub
WHERE public.food_entries.id = sub.id;
