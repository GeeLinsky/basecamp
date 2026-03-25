ALTER TABLE public.food_presets RENAME TO food_favorites;

ALTER POLICY "Users can view their own presets" ON public.food_favorites RENAME TO "Users can view their own favorites";
ALTER POLICY "Users can create their own presets" ON public.food_favorites RENAME TO "Users can create their own favorites";
ALTER POLICY "Users can update their own presets" ON public.food_favorites RENAME TO "Users can update their own favorites";
ALTER POLICY "Users can delete their own presets" ON public.food_favorites RENAME TO "Users can delete their own favorites";
