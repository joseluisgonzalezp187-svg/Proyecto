export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full body',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barra: 'Barra',
  mancuernas: 'Mancuernas',
  maquina: 'Máquina',
  polea: 'Polea',
  peso_corporal: 'Peso corporal',
  kettlebell: 'Kettlebell',
  otro: 'Otro',
};

export const GOAL_LABELS: Record<string, string> = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  resistencia: 'Resistencia',
  general: 'General',
};

export const DEFAULT_REST_SECONDS = 90;
export const MAX_DAYS_PER_WEEK = 7;
export const MIN_DAYS_PER_WEEK = 1;

export const APP_COLORS = {
  primary: '#B6FF2B',
  primaryPressed: '#99E51D',
  primaryDark: '#75C900',
  background: '#0B0D0C',
  surface: '#151918',
  surfaceElevated: '#1C211F',
  surfaceSoft: '#242A27',
  surfaceAccent: '#202D17',
  text: '#F5F7F4',
  textMuted: '#9BA6A0',
  textSubtle: '#6F7A73',
  border: '#2A312E',
  borderStrong: '#3A443F',
  success: '#5BE37D',
  error: '#FF7777',
  warning: '#FFC857',
  info: '#6CB6FF',
} as const;

export const APP_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const APP_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const APP_SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;
