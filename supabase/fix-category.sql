-- Ejecutar en Supabase > SQL Editor
ALTER TABLE public.workout_posts
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_workout_posts_category
  ON public.workout_posts(category);

NOTIFY pgrst, 'reload schema';
