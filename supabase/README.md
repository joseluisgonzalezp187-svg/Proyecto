# Configuración de Supabase

## 1. Crear proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis.
2. Crea un nuevo proyecto (región cercana a ti).
3. Espera a que termine de aprovisionarse (~2 min).

## 2. Ejecutar SQL

En **SQL Editor**, ejecuta en este orden:

1. `supabase/schema.sql` — tablas, RLS y triggers
2. `supabase/seed.sql` — ejercicios y anuncios demo

## 3. Configurar Auth

En **Authentication → Providers → Email**:

- Activa Email provider
- (Opcional) Desactiva "Confirm email" para desarrollo rápido

## 4. Variables de entorno

Copia las credenciales de **Project Settings → API**:

```bash
cp .env.example .env
```

Rellena:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

## 5. Evitar pausa por inactividad (opcional)

El tier free pausa el proyecto tras ~7 días sin uso. Para evitarlo:

- Usa la app regularmente, o
- Configura un ping semanal con GitHub Actions

## Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil del usuario |
| `exercises` | Catálogo global de ejercicios |
| `routines` | Rutinas del usuario |
| `routine_days` | Días de cada rutina |
| `routine_exercises` | Ejercicios con series/reps/peso |
| `workout_sessions` | Historial de entrenos |
| `session_sets` | Sets registrados |
| `nutrition_ads` | Publicidad de nutrición en home |
