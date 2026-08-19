-- Ejecutar en Supabase > SQL Editor
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE public.profiles
SET username = COALESCE(
  NULLIF(LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]+', '-', 'g')), ''),
  'usuario'
)
WHERE username IS NULL OR username = '';

NOTIFY pgrst, 'reload schema';
