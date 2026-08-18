import { create } from 'zustand';

interface ActiveSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

interface WorkoutState {
  sessionId: string | null;
  routineDayId: string | null;
  routineDayName: string | null;
  currentExerciseIndex: number;
  restSecondsRemaining: number;
  isResting: boolean;
  completedSets: Record<string, boolean[]>;
  activeSet: ActiveSet | null;

  startSession: (sessionId: string, routineDayId: string, dayName: string) => void;
  endSession: () => void;
  setActiveSet: (set: ActiveSet | null) => void;
  completeSet: (exerciseId: string, setIndex: number) => void;
  startRest: (seconds: number) => void;
  tickRest: () => void;
  skipRest: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessionId: null,
  routineDayId: null,
  routineDayName: null,
  currentExerciseIndex: 0,
  restSecondsRemaining: 0,
  isResting: false,
  completedSets: {},
  activeSet: null,

  startSession: (sessionId, routineDayId, dayName) =>
    set({
      sessionId,
      routineDayId,
      routineDayName: dayName,
      currentExerciseIndex: 0,
      completedSets: {},
      isResting: false,
      restSecondsRemaining: 0,
      activeSet: null,
    }),

  endSession: () =>
    set({
      sessionId: null,
      routineDayId: null,
      routineDayName: null,
      currentExerciseIndex: 0,
      completedSets: {},
      isResting: false,
      restSecondsRemaining: 0,
      activeSet: null,
    }),

  setActiveSet: (activeSet) => set({ activeSet }),

  completeSet: (exerciseId, setIndex) => {
    const prev = get().completedSets[exerciseId] ?? [];
    const next = [...prev];
    next[setIndex] = true;
    set({ completedSets: { ...get().completedSets, [exerciseId]: next } });
  },

  startRest: (seconds) => set({ isResting: true, restSecondsRemaining: seconds }),

  tickRest: () => {
    const remaining = get().restSecondsRemaining - 1;
    if (remaining <= 0) {
      set({ isResting: false, restSecondsRemaining: 0 });
    } else {
      set({ restSecondsRemaining: remaining });
    }
  },

  skipRest: () => set({ isResting: false, restSecondsRemaining: 0 }),
}));
