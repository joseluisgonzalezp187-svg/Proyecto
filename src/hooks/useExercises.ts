import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Exercise, NutritionAd, Routine } from '@/types/database';

export interface WorkoutProgressSession {
  id: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  session_sets: Array<{
    exercise_id: string;
    reps: number;
    weight_kg: number;
    completed: boolean;
    exercise: { name: string } | null;
  }>;
}

export function useExercises(muscleGroup?: string) {
  return useQuery({
    queryKey: ['exercises', muscleGroup],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (muscleGroup) query = query.eq('muscle_group', muscleGroup);
      const { data, error } = await query;
      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Routine[];
    },
  });
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: ['routine', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_days (
            *,
            routine_exercises (
              *,
              exercise:exercises (*)
            )
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useNutritionAds() {
  return useQuery({
    queryKey: ['nutrition-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_ads')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as NutritionAd[];
    },
  });
}

export function useWorkoutProgress() {
  return useQuery({
    queryKey: ['workout-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          started_at,
          finished_at,
          notes,
          session_sets (
            exercise_id,
            reps,
            weight_kg,
            completed,
            exercise:exercises (name)
          )
        `)
        .not('finished_at', 'is', null)
        .order('started_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((session) => ({
        ...session,
        session_sets: session.session_sets.map((set) => ({
          ...set,
          exercise: Array.isArray(set.exercise) ? set.exercise[0] ?? null : set.exercise ?? null,
        })),
      })) as WorkoutProgressSession[];
    },
  });
}
