export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'gluteos'
  | 'core'
  | 'cardio'
  | 'full_body';

export type EquipmentType =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'peso_corporal'
  | 'kettlebell'
  | 'otro';

export type RoutineGoal = 'fuerza' | 'hipertrofia' | 'resistencia' | 'general';

export interface Profile {
  id: string;
  email: string;
    display_name: string | null;
  username: string;

  weight_unit: 'kg' | 'lb';
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: EquipmentType;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  days_per_week: number;
  goal: RoutineGoal | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  day_number: number;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  sort_order: number;
  sets: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  routine_day_id: string | null;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
}

export interface SessionSet {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: boolean;
  created_at: string;
}

export type ForumCategory = 'general' | 'rutinas' | 'ejercicios' | 'nutricion' | 'progreso' | 'preguntas';

export interface WorkoutPost {
  id: string;
  user_id: string;
  workout_session_id: string | null;
  title: string;
  content: string | null;
  category: ForumCategory;
  duration_seconds: number | null;
  completed_sets: number;
  total_sets: number;
  exercise_count: number;
  created_at: string;
  profile?: Pick<Profile, 'username' | 'display_name'> | null;
  comments?: WorkoutComment[];
  reactions?: WorkoutReaction[];
  reactionCount?: number;
  hasReacted?: boolean;
}

export interface CreateForumPostInput {
  userId: string;
  title: string;
  content: string;
  category: ForumCategory;
}

export interface WorkoutReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: 'like' | 'fire' | 'strong';
  created_at: string;
}

export interface WorkoutComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Pick<Profile, 'username' | 'display_name'> | null;
}

export interface NutritionAd {

  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface RoutineWithDays extends Routine {
  routine_days: (RoutineDay & {
    routine_exercises: RoutineExercise[];
  })[];
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  days_per_week: number;
  goal?: RoutineGoal;
  days: {
    day_number: number;
    name: string;
    exercises: {
      exercise_id: string;
      sets: number;
      reps: number;
      weight_kg: number;
      rest_seconds?: number;
    }[];
  }[];
}
