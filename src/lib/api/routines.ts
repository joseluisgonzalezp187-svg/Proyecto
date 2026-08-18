import { supabase } from '@/lib/supabase/client';
import { CreateRoutineInput, SessionSet } from '@/types/database';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

export async function createRoutine(input: CreateRoutineInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description ?? null,
      days_per_week: input.days_per_week,
      goal: input.goal ?? null,
    })
    .select()
    .single();
  if (routineError) throw routineError;

  for (const day of input.days) {
    const { data: routineDay, error: dayError } = await supabase
      .from('routine_days')
      .insert({
        routine_id: routine.id,
        day_number: day.day_number,
        name: day.name,
        sort_order: day.day_number,
      })
      .select()
      .single();
    if (dayError) throw dayError;

    if (day.exercises.length) {
      const exercises = day.exercises.map((exercise, index) => ({
        routine_day_id: routineDay.id,
        exercise_id: exercise.exercise_id,
        sort_order: index,
        sets: exercise.sets,
        reps: exercise.reps,
        weight_kg: exercise.weight_kg,
        rest_seconds: exercise.rest_seconds ?? 90,
      }));
      const { error: exerciseError } = await supabase.from('routine_exercises').insert(exercises);
      if (exerciseError) throw exerciseError;
    }
  }

  return routine;
}

export async function startWorkoutSession(routineId: string, routineDayId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      routine_id: routineId,
      routine_day_id: routineDayId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finishWorkoutSession(sessionId: string, notes?: string) {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      finished_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function completeSessionSet(input: {
  workoutSessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
}) {
  const { data, error } = await supabase
    .from('session_sets')
    .insert({
      workout_session_id: input.workoutSessionId,
      exercise_id: input.exerciseId,
      set_number: input.setNumber,
      reps: input.reps,
      weight_kg: input.weightKg,
      completed: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SessionSet;
}
