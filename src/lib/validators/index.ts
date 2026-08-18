import { createRoutineSchema } from '@/lib/validators/routines';

export { loginSchema, registerSchema } from '@/lib/validators/auth';
export { createRoutineSchema };
export type { LoginInput, RegisterInput } from '@/lib/validators/auth';
export type { CreateRoutineInput } from '@/lib/validators/routines';
