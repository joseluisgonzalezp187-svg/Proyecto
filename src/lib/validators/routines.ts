import { z } from 'zod';

export const routineExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
  weight_kg: z.number().min(0),
  rest_seconds: z.number().int().min(0).max(600).optional(),
});

export const routineDaySchema = z.object({
  day_number: z.number().int().min(1).max(7),
  name: z.string().min(1, 'Nombre del día requerido'),
  exercises: z.array(routineExerciseSchema).min(1, 'Añade al menos un ejercicio'),
});

export const createRoutineSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().optional(),
  days_per_week: z.number().int().min(1).max(7),
  goal: z.enum(['fuerza', 'hipertrofia', 'resistencia', 'general']).optional(),
  days: z.array(routineDaySchema).min(1),
});

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
