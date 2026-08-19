-- Ejecutar en Supabase > SQL Editor
-- 1) Esta consulta debe devolver un UUID y el rol authenticated cuando se ejecuta desde la app.
SELECT auth.uid() AS current_user_id, auth.role() AS current_role;

-- 2) Reemplazar las políticas de workout_posts.
ALTER TABLE public.workout_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_posts_select_authenticated" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_insert_own" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_update_own" ON public.workout_posts;
DROP POLICY IF EXISTS "workout_posts_delete_own" ON public.workout_posts;

CREATE POLICY "workout_posts_select_authenticated"
  ON public.workout_posts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workout_posts_insert_own"
  ON public.workout_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "workout_posts_update_own"
  ON public.workout_posts FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "workout_posts_delete_own"
  ON public.workout_posts FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

NOTIFY pgrst, 'reload schema';

-- 3) Comprobar que la política quedó instalada.
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'workout_posts';
