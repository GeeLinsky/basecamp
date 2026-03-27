ALTER TABLE public.food_favorites ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

UPDATE public.food_favorites SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY label) AS rn
  FROM public.food_favorites
) sub
WHERE public.food_favorites.id = sub.id;
