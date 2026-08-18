# GymRoutines 💪

Aplicación móvil multiplataforma (**iOS + Android**) para crear rutinas de gimnasio de forma simple: selecciona ejercicios predefinidos, define series, repeticiones y peso, y elige cuántos días a la semana quieres entrenar.

Proyecto personal de aprendizaje pensado para uso propio y de un grupo pequeño de amigos, con backend en la nube **100% gratis**.

---

## Autor

**Jose** — Estudiante

---

## Descripción del proyecto

GymRoutines resuelve un problema concreto: crear y seguir rutinas de entrenamiento **sin complicaciones**. Los ejercicios ya están en la base de datos; el usuario solo los selecciona y configura:

- Número de **series**
- Número de **repeticiones**
- **Peso** (kg)
- **Días por semana** (1 a 7, libre elección)

### Funcionalidades

| Estado | Función |
|--------|---------|
| ✅ MVP | Registro e inicio de sesión con email y contraseña |
| ✅ MVP | Crear rutinas con wizard de 2 pasos |
| ✅ MVP | Catálogo de ~30 ejercicios predefinidos |
| ✅ MVP | Días flexibles (1–7 por semana) |
| ✅ MVP | Ver detalle de rutina por días |
| ✅ MVP | Modo entreno con timer de descanso |
| ✅ MVP | Banner de publicidad de nutrición en home |
| 🔜 Fase 2 | Gráficos de progreso y PRs |
| 🔜 Fase 2 | Plantillas pre-hechas (PPL, Full Body…) |
| 🔜 Fase 3 | Compartir rutinas entre usuarios |
| 🔜 Fase 3 | Publicar en App Store / Google Play |

---

## Stack tecnológico

### Frontend (App móvil)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| [Expo](https://expo.dev) | ~52 | Framework React Native, desarrollo cross-platform |
| [React Native](https://reactnative.dev) | 0.76 | UI nativa iOS y Android |
| [TypeScript](https://www.typescriptlang.org) | ~5.7 | Tipado estático |
| [Expo Router](https://docs.expo.dev/router/introduction/) | ~4 | Navegación file-based (tipo Next.js) |
| [React Native Paper](https://callstack.github.io/react-native-paper/) | ^5 | Componentes Material Design |
| [Zustand](https://zustand.docs.pmnd.rs) | ^5 | Estado local (modo entreno, timer) |
| [TanStack Query](https://tanstack.com/query) | ^5 | Cache y fetching de datos |
| [Zod](https://zod.dev) | ^3 | Validación de formularios |

### Backend (Nube gratis)

| Tecnología | Uso |
|------------|-----|
| [Supabase](https://supabase.com) | PostgreSQL + Auth + Storage + API REST |
| Row Level Security (RLS) | Cada usuario solo accede a sus datos |
| Supabase Auth | Email/contraseña, reset password |

### Build y despliegue

| Servicio | Coste | Uso |
|----------|-------|-----|
| [Expo Go](https://expo.dev/go) | Gratis | Probar en iPhone/Android sin build |
| [EAS Build](https://docs.expo.dev/build/introduction/) | Gratis (15 builds/mes) | Generar APK/IPA |
| [Vercel](https://vercel.com) | — | No necesario (app móvil pura) |
| Apple Developer | 99 USD/año | Solo para App Store (opcional) |
| Google Play | 25 USD único | Solo para Play Store (opcional) |

---

## Estructura del proyecto

```
Proyecto/
├── app/                          # Pantallas (Expo Router)
│   ├── _layout.tsx               # Layout raíz + providers
│   ├── index.tsx                 # Redirect auth
│   ├── (auth)/                   # Login, registro, recuperar contraseña
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Navegación principal
│   │   ├── index.tsx             # Home + publicidad nutrición
│   │   ├── routines.tsx          # Lista de rutinas
│   │   ├── progress.tsx          # Progreso (fase 2)
│   │   └── profile.tsx           # Perfil y logout
│   ├── routines/
│   │   ├── new.tsx               # Wizard crear rutina
│   │   └── [id].tsx              # Detalle de rutina
│   └── train/
│       └── [dayId].tsx           # Modo entreno en vivo
│
├── src/
│   ├── components/
│   │   ├── ads/                  # Carrusel publicidad nutrición
│   │   ├── exercises/            # Tarjetas de ejercicios
│   │   ├── routines/             # Tarjetas de rutinas
│   │   └── ui/                   # Loading, headers…
│   ├── hooks/
│   │   └── useExercises.ts       # TanStack Query hooks
│   ├── lib/
│   │   ├── api/                  # Llamadas Supabase
│   │   ├── constants/            # Colores, labels
│   │   ├── supabase/             # Cliente Supabase
│   │   └── validators/           # Schemas Zod
│   ├── providers/
│   │   ├── AuthProvider.tsx      # Contexto de sesión
│   │   ├── AppProviders.tsx      # React Query
│   │   └── ThemeProvider.tsx     # Tema oscuro
│   ├── stores/
│   │   └── workoutStore.ts       # Estado del entreno activo
│   └── types/
│       └── database.ts           # Tipos TypeScript
│
├── supabase/
│   ├── schema.sql                # Esquema completo + RLS
│   ├── seed.sql                  # Ejercicios y ads demo
│   └── README.md                 # Guía configuración Supabase
│
├── assets/                       # Iconos e imágenes de la app
├── app.config.ts                 # Configuración Expo
├── eas.json                      # Configuración EAS Build
├── .env.example                  # Variables de entorno
└── package.json
```

---

## Requisitos previos

1. **Node.js 20+** — [nodejs.org](https://nodejs.org)
2. **Cuenta Supabase** — [supabase.com](https://supabase.com) (gratis)
3. **Expo Go** en tu móvil — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
4. *(Opcional)* Android Studio — emulador Android en Windows

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd Proyecto
npm install
```

### 2. Configurar Supabase

Sigue la guía en [`supabase/README.md`](./supabase/README.md):

1. Crear proyecto en Supabase
2. Ejecutar `schema.sql` y `seed.sql`
3. Copiar `.env.example` → `.env` y rellenar credenciales

### 3. Assets (iconos)

Genera o copia iconos en `assets/`. Ver [`assets/README.md`](./assets/README.md).

### 4. Arrancar la app

```bash
npm start
```

- **iPhone:** escanea el QR con la cámara → se abre Expo Go
- **Android:** escanea el QR con Expo Go, o pulsa `a` para emulador
- **Misma WiFi** o usa túnel: `npm run start:tunnel`

---

## Flujo de uso

```
Registro/Login
     ↓
Home (próximo entreno + ads nutrición)
     ↓
Crear rutina → Elegir días/semana → Añadir ejercicios (series/reps/peso)
     ↓
Ver rutina → Elegir día → Modo entreno (timer + marcar sets)
     ↓
Historial / Progreso (fase 2)
```

---

## Modelo de datos

```
Usuario (auth.users)
  └── Perfil (profiles)
  └── Rutinas (routines)
        └── Días (routine_days) × 1-7
              └── Ejercicios (routine_exercises)
                    ├── exercise_id → exercises (catálogo global)
                    ├── sets, reps, weight_kg, rest_seconds
  └── Sesiones (workout_sessions)
        └── Sets completados (session_sets)

Anuncios (nutrition_ads) — global, solo lectura
Ejercicios (exercises) — global, solo lectura
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Expo Dev Server |
| `npm run start:tunnel` | Inicia con túnel (distinta WiFi) |
| `npm run android` | Abre en emulador Android |
| `npm run ios` | Abre simulador iOS *(requiere Mac)* |
| `npm run typecheck` | Verifica tipos TypeScript |

---

## Distribuir a amigos (sin App Store)

### Android (APK gratis)

```bash
npx eas build --platform android --profile preview
```

Comparte el APK por WhatsApp/Drive.

### iOS (sin Mac)

```bash
npx eas build --platform ios --profile preview
```

Requiere cuenta Apple (gratis o de pago según método de instalación).

### Desarrollo rápido

Pasa el QR de Expo Go a tus amigos. Todos deben tener Expo Go instalado.

---

## Costes estimados

| Concepto | Coste |
|----------|-------|
| Desarrollo y testing | **0 €** |
| Supabase (tier free) | **0 €** |
| Expo Go + EAS free | **0 €** |
| App Store (Apple) | 99 USD/año *(opcional)* |
| Google Play | 25 USD único *(opcional)* |

---

## Roadmap

### Fase 1 — MVP ✅ (estructura actual)
- Auth, rutinas, ejercicios, modo entreno básico, ads

### Fase 2 — Retención
- Gráficos de progreso (Recharts o Victory Native)
- Plantillas pre-hechas
- Récords personales (PRs)
- Autocompletar último peso usado

### Fase 3 — Crecimiento
- Compartir rutinas (link público)
- Afiliados nutrición con tracking
- PWA / builds de producción
- Superseries y RPE

---

## Inspiración (competencia analizada)

Funciones tomadas de apps como **Jefit**, **Hevy**, **Strong** y **Fitbod**:

- Catálogo de ejercicios con filtros por músculo
- Creación rápida de rutinas
- Timer de descanso por ejercicio
- Historial de sesiones
- Plantillas de comunidad *(fase 2)*
- Export CSV *(fase 3)*

---

## Licencia

Proyecto personal/educativo. Uso libre para aprendizaje.

---

## Próximos pasos

1. Instalar Node.js si no lo tienes
2. Configurar Supabase (`supabase/README.md`)
3. `npm install && npm start`
4. Escanear QR con Expo Go en tu iPhone
5. Crear tu primera rutina 🏋️
