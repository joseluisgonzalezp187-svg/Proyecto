-- GymRoutines — Esquema de base de datos para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ────────────────────────────────────────────────────────────────

CREATE TYPE muscle_group AS ENUM (
  'pecho', 'espalda', 'hombros', 'biceps', 'triceps',
  'piernas', 'gluteos', 'core', 'cardio', 'full_body'
);

CREATE TYPE equipment_type AS ENUM (
  'barra', 'mancuernas', 'maquina', 'polea', 'peso_corporal', 'kettlebell', 'otro'
);

-- ─── PERFILES ───────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT,
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATÁLOGO DE EJERCICIOS (global, solo lectura para usuarios) ────────────

CREATE TABLE exercises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  muscle_group  muscle_group NOT NULL,
  equipment     equipment_type NOT NULL DEFAULT 'otro',
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX idx_exercises_name ON exercises(name);

-- ─── RUTINAS ────────────────────────────────────────────────────────────────

CREATE TABLE routines (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  days_per_week  INT NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  goal           TEXT CHECK (goal IN ('fuerza', 'hipertrofia', 'resistencia', 'general')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user ON routines(user_id);

-- ─── DÍAS DE RUTINA ─────────────────────────────────────────────────────────

CREATE TABLE routine_days (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id  UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  day_number  INT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (routine_id, day_number)
);

CREATE INDEX idx_routine_days_routine ON routine_days(routine_id);

-- ─── EJERCICIOS POR DÍA ─────────────────────────────────────────────────────

CREATE TABLE routine_exercises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_day_id UUID NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id   UUID NOT NULL REFERENCES exercises(id),
  sort_order    INT NOT NULL DEFAULT 0,
  sets          INT NOT NULL DEFAULT 3 CHECK (sets BETWEEN 1 AND 20),
  reps          INT NOT NULL DEFAULT 10 CHECK (reps BETWEEN 1 AND 100),
  weight_kg     DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (weight_kg >= 0),
  rest_seconds  INT NOT NULL DEFAULT 90 CHECK (rest_seconds BETWEEN 0 AND 600),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routine_exercises_day ON routine_exercises(routine_day_id);

-- ─── SESIONES DE ENTRENO (historial) ─────────────────────────────────────────

CREATE TABLE workout_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id      UUID REFERENCES routines(id) ON DELETE SET NULL,
  routine_day_id  UUID REFERENCES routine_days(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX idx_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_sessions_date ON workout_sessions(started_at DESC);

-- ─── SETS REGISTRADOS ─────────────────────────────────────────────────────────

CREATE TABLE session_sets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id  UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id),
  set_number          INT NOT NULL CHECK (set_number >= 1),
  reps                INT NOT NULL,
  weight_kg           DECIMAL(6,2) NOT NULL DEFAULT 0,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_sets_session ON session_sets(workout_session_id);

-- ─── ANUNCIOS NUTRICIÓN (home) ────────────────────────────────────────────────

CREATE TABLE nutrition_ads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  link_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TRIGGER: crear perfil al registrarse ─────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TRIGGER: updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_ads ENABLE ROW LEVEL SECURITY;

-- Perfiles: solo el propio usuario
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Ejercicios: lectura pública para autenticados
CREATE POLICY "exercises_select" ON exercises FOR SELECT TO authenticated USING (is_active = TRUE);

-- Rutinas: CRUD propio
CREATE POLICY "routines_all_own" ON routines FOR ALL USING (auth.uid() = user_id);

-- Días: acceso vía rutina propia
CREATE POLICY "routine_days_all" ON routine_days FOR ALL
  USING (EXISTS (SELECT 1 FROM routines r WHERE r.id = routine_id AND r.user_id = auth.uid()));

-- Ejercicios de día: acceso vía rutina propia
CREATE POLICY "routine_exercises_all" ON routine_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM routine_days rd
    JOIN routines r ON r.id = rd.routine_id
    WHERE rd.id = routine_day_id AND r.user_id = auth.uid()
  ));

-- Sesiones: CRUD propio
CREATE POLICY "sessions_all_own" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Sets: acceso vía sesión propia
CREATE POLICY "session_sets_all" ON session_sets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = workout_session_id AND ws.user_id = auth.uid()
  ));

-- Anuncios: lectura para autenticados
CREATE POLICY "nutrition_ads_select" ON nutrition_ads FOR SELECT TO authenticated USING (is_active = TRUE);
