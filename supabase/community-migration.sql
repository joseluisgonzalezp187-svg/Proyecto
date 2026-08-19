-- GymRoutines: migración independiente de la comunidad
-- Ejecutar en Supabase > SQL Editor después del schema.sql base.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE public.profiles
SET username = COALESCE(
  NULLIF(LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]+', '-', 'g')), ''),
  'usuario'
)
WHERE username IS NULL OR username = '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (LOWER(username));

CREATE TABLE IF NOT EXISTS public.workout_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  duration_seconds INT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  completed_sets INT NOT NULL DEFAULT 0 CHECK (completed_sets >= 0),
  total_sets INT NOT NULL DEFAULT 0 CHECK (total_sets >= 0),
  exercise_count INT NOT NULL DEFAULT 0 CHECK (exercise_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workout_posts
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';

CREATE TABLE IF NOT EXISTS public.workout_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.workout_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.workout_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction IN ('like', 'fire', 'strong')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "workout_posts_select_authenticated" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_insert_own" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_update_own" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_delete_own" ON public.workout_posts;
CREATE POLICY "workout_posts_select_authenticated" ON public.workout_posts
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "workout_posts_insert_own" ON public.workout_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_posts_update_own" ON public.workout_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "workout_posts_delete_own" ON public.workout_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_comments_select_authenticated" ON public.workout_comments;
DROP POLICY IF EXISTS "workout_comments_insert_own" ON public.workout_comments;
DROP POLICY IF EXISTS "workout_comments_delete_own" ON public.workout_comments;
CREATE POLICY "workout_comments_select_authenticated" ON public.workout_comments
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "workout_comments_insert_own" ON public.workout_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_comments_delete_own" ON public.workout_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_reactions_select_authenticated" ON public.workout_post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_own" ON public.workout_post_reactions;
DROP POLICY IF EXISTS "post_reactions_update_own" ON public.workout_post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_own" ON public.workout_post_reactions;
CREATE POLICY "post_reactions_select_authenticated" ON public.workout_post_reactions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "post_reactions_insert_own" ON public.workout_post_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_reactions_update_own" ON public.workout_post_reactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "post_reactions_delete_own" ON public.workout_post_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
