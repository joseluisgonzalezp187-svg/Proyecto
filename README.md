# GymRoutines

Aplicación móvil multiplataforma para crear rutinas de gimnasio, registrar entrenamientos y participar en una comunidad centrada en el entrenamiento.

El proyecto está construido con Expo y React Native, utiliza Supabase como backend y está pensado para aprender, probar funcionalidades con un grupo reducido de personas y evolucionar progresivamente hacia una comunidad de entrenamiento.

---

## Autor

**Jose** — Proyecto personal y educativo.

---

## Descripción

GymRoutines permite crear rutinas sin complicaciones: el usuario selecciona ejercicios, define series, repeticiones, peso y días de entrenamiento, y después puede ejecutar cada sesión con un temporizador de descanso.

Además del seguimiento individual, la aplicación incorpora un **foro general de entrenamiento**. Cualquier usuario autenticado puede abrir temas sobre rutinas, ejercicios, nutrición, progreso o dudas, y el resto de la comunidad puede comentar y reaccionar.

---

## Funcionalidades actuales

| Estado | Funcionalidad |
|---|---|
| Implementado | Registro e inicio de sesión con email y contraseña |
| Implementado | Creación de rutinas mediante un wizard de dos pasos |
| Implementado | Catálogo de ejercicios predefinidos |
| Implementado | Configuración flexible de uno a siete días por semana |
| Implementado | Consulta del detalle de una rutina por días |
| Implementado | Modo de entrenamiento con temporizador de descanso |
| Implementado | Registro de sesiones y sets completados |
| Implementado | Perfil editable con nombre de usuario único |
| Implementado | Pestaña Comunidad con feed de publicaciones |
| Implementado | Foro general con creación de nuevos temas |
| Implementado | Categorías General, Rutinas, Ejercicios, Nutrición, Progreso y Preguntas |
| Implementado | Comentarios persistentes en las publicaciones |
| Implementado | Likes y reacciones de fuego o fuerza |
| Implementado | Una reacción por usuario y publicación, con posibilidad de cambiarla o quitarla |
| Implementado | Opción de compartir una sesión completada en la comunidad |
| Implementado | Publicación asociada a un nombre de usuario visible |
| Implementado | Marca de agua central eliminada del fondo; se conserva el logo pequeño de la esquina |
| Pendiente | Gráficos de progreso y récords personales |
| Pendiente | Plantillas prediseñadas como PPL o Full Body |
| Pendiente | Moderación, reportes y administración del foro |
| Pendiente | Seguidores, notificaciones y perfiles públicos ampliados |
| Pendiente | Publicación de imágenes o vídeos en los temas |
| Pendiente | Distribución de producción en App Store y Google Play |

---

## Stack tecnológico

### Frontend

| Tecnología | Uso |
|---|---|
| [Expo](https://expo.dev) | Framework de desarrollo para iOS y Android |
| [React Native](https://reactnative.dev) | Interfaz móvil nativa |
| [TypeScript](https://www.typescriptlang.org) | Tipado estático |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegación basada en archivos |
| [React Native Paper](https://callstack.github.io/react-native-paper/) | Componentes visuales |
| [Zustand](https://zustand.docs.pmnd.rs) | Estado local del entrenamiento |
| [TanStack Query](https://tanstack.com/query) | Caché, consultas y mutaciones asíncronas |
| [Zod](https://zod.dev) | Validación de datos |

### Backend

| Tecnología | Uso |
|---|---|
| [Supabase](https://supabase.com) | PostgreSQL, autenticación y API REST |
| Supabase Auth | Registro, inicio de sesión y recuperación de contraseña |
| Row Level Security (RLS) | Control de acceso por usuario |
| PostgREST | Acceso a las tablas desde el cliente Supabase |

---

## Estructura relevante del proyecto

```text
Proyecto/
├── app/
│   ├── _layout.tsx                 # Layout raíz y proveedores
│   ├── index.tsx                   # Redirección según la sesión
│   ├── (auth)/                     # Login, registro y recuperación
│   ├── (tabs)/
│   │   ├── index.tsx               # Inicio
│   │   ├── routines.tsx            # Rutinas
│   │   ├── progress.tsx            # Progreso
│   │   ├── community.tsx           # Foro, temas, comentarios y reacciones
│   │   └── profile.tsx             # Perfil y nombre de usuario
│   ├── routines/
│   │   ├── new.tsx                 # Crear rutina
│   │   └── [id].tsx                # Detalle de rutina
│   └── train/
│       └── [dayId].tsx             # Entrenamiento en vivo y compartir sesión
│
├── src/
│   ├── components/
│   │   ├── ads/                    # Publicidad de nutrición
│   │   ├── exercises/              # Componentes de ejercicios
│   │   ├── routines/               # Componentes de rutinas
│   │   └── ui/                     # Componentes visuales comunes
│   ├── hooks/
│   │   └── useCommunity.ts         # Hooks del foro y React Query
│   ├── lib/
│   │   ├── api/
│   │   │   └── community.ts        # Perfiles, temas, comentarios y reacciones
│   │   ├── constants/              # Colores y constantes visuales
│   │   ├── supabase/               # Cliente Supabase
│   │   └── validators/             # Validadores Zod
│   ├── providers/
│   │   ├── AuthProvider.tsx        # Sesión de usuario
│   │   ├── AppProviders.tsx        # React Query
│   │   └── ThemeProvider.tsx       # Tema de la aplicación
│   ├── stores/
│   │   └── workoutStore.ts         # Estado del entrenamiento activo
│   └── types/
│       └── database.ts             # Tipos de la base de datos y foro
│
├── supabase/
│   ├── schema.sql                  # Esquema base y migración social acumulada
│   ├── community-migration.sql     # Migración independiente del foro
│   ├── fix-username.sql            # Corrección de profiles.username
│   ├── fix-category.sql            # Corrección de workout_posts.category
│   ├── fix-workout-posts-rls.sql   # Políticas RLS de publicaciones
│   └── seed.sql                    # Datos iniciales
│
├── assets/                         # Iconos e imágenes
├── app.config.ts                   # Configuración Expo
├── eas.json                        # Configuración EAS Build
├── .env.example                    # Plantilla de variables de entorno
├── .env                            # Variables locales; no subir al repositorio
└── package.json
```

---

## Modelo de datos

La parte individual de la aplicación conserva las rutinas y las sesiones de entrenamiento. La parte social añade perfiles, temas, comentarios y reacciones.

```text
auth.users
  └── profiles
        └── username y display_name

profiles / auth.users
  └── workout_posts
        ├── category: general | rutinas | ejercicios | nutricion | progreso | preguntas
        ├── workout_session_id opcional
        ├── workout_comments
        │     └── profile del autor
        └── workout_post_reactions
              └── una reacción por usuario y publicación

routines
  └── routine_days
        └── routine_exercises
              └── exercises

workout_sessions
  └── session_sets
```

Las publicaciones del foro pueden ser independientes de una sesión completada. Una sesión de entrenamiento solo se asocia a una publicación cuando el usuario decide compartirla.

---

## Configuración de Supabase

El proyecto utiliza el proyecto de Supabase cuyo identificador es `minrpmgqehkjghodpghi`. La aplicación obtiene la URL y la clave pública desde `.env` mediante las variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Configuración inicial

1. Crea o abre el proyecto en [Supabase](https://supabase.com).
2. Ejecuta el esquema base y los datos iniciales:

   ```text
   supabase/schema.sql
   supabase/seed.sql
   ```

3. Si la base de datos ya existía antes de añadir el foro, ejecuta `supabase/community-migration.sql` completo.
4. Comprueba en **Table Editor** que existan las tablas:

   ```text
   workout_posts
   workout_comments
   workout_post_reactions
   ```

5. Comprueba que `profiles` tenga la columna `username` y que `workout_posts` tenga la columna `category`.
6. Revisa las políticas RLS si aparece un error de permisos al publicar.

### Migraciones de reparación

Estos archivos son correcciones independientes para instalaciones que ejecutaron solo una parte de la migración social:

| Archivo | Cuándo usarlo |
|---|---|
| `fix-username.sql` | Cuando falta `profiles.username` |
| `fix-category.sql` | Cuando falta `workout_posts.category` |
| `fix-workout-posts-rls.sql` | Cuando aparece `new row violates row-level security policy for table workout_posts` |

Las migraciones usan `IF NOT EXISTS`, eliminan y recrean las políticas necesarias cuando corresponde, y solicitan a PostgREST recargar la caché del esquema mediante `NOTIFY pgrst, 'reload schema'`.

### Comprobaciones SQL útiles

Para comprobar las tablas del foro:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('workout_posts', 'workout_comments', 'workout_post_reactions');
```

Para comprobar las columnas nuevas:

```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'profiles' AND column_name = 'username')
    OR (table_name = 'workout_posts' AND column_name = 'category')
  );
```

Para diagnosticar el usuario y rol de una sesión de Supabase:

```sql
SELECT auth.uid() AS current_user_id, auth.role() AS current_role;
```

La aplicación debe publicar usando el mismo UUID que devuelve `auth.uid()`, y la sesión debe estar autenticada. Si el rol es `anon` o el UUID es `null`, hay que cerrar sesión y volver a iniciar sesión en la aplicación.

---

## Requisitos previos

1. **Node.js 20 o superior** — [nodejs.org](https://nodejs.org).
2. **Cuenta de Supabase** — [supabase.com](https://supabase.com).
3. **Expo Go** en el móvil — [iOS](https://apps.apple.com/app/expo-go/id982107779) o [Android](https://play.google.com/store/apps/details?id=host.exp.exponent).
4. Android Studio, opcional para usar un emulador Android en Windows.

---

## Instalación y ejecución

Instala las dependencias desde la carpeta del proyecto:

```bash
cd Proyecto
npm install
```

Copia `.env.example` a `.env` y configura las credenciales públicas de Supabase. Después inicia Expo:

```bash
npm start
```

En PowerShell de Windows puede aparecer un error indicando que `npm.ps1` está bloqueado por la política de ejecución. En ese caso utiliza:

```powershell
npm.cmd start
```

También puedes usar CMD:

```cmd
cd C:\Users\maari\Desktop\Proyecto
npm start
```

Para abrir el proyecto en web, pulsa `w` después de iniciar Expo. Para abrir un emulador Android, pulsa `a`. Para una red Wi-Fi diferente, utiliza:

```bash
npm run start:tunnel
```

---

## Flujo actual de uso

```text
Registro / Inicio de sesión
        ↓
Inicio
        ↓
Crear rutina → elegir días → añadir ejercicios
        ↓
Ver rutina → elegir día → ejecutar entrenamiento
        ↓
Finalizar sesión → compartirla opcionalmente en Comunidad
        ↓
Comunidad / Foro
        ├── Nuevo tema
        │     ├── título
        │     ├── contenido
        │     └── categoría
        ├── comentar publicaciones
        └── reaccionar con Like, Fuego o Fuerza
```

Para abrir un tema, entra en **Comunidad**, pulsa **Nuevo tema**, escribe un título y contenido, elige una categoría y pulsa **Publicar tema**. Para interactuar con una publicación, utiliza los botones de reacción o abre la sección de comentarios.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm.cmd start` | Equivalente recomendado en PowerShell de Windows cuando `npm.ps1` está bloqueado |
| `npm run start:tunnel` | Inicia Expo mediante túnel |
| `npm run android` | Abre el proyecto en un emulador Android |
| `npm run ios` | Abre el simulador iOS; requiere macOS |
| `npm run typecheck` | Comprueba los tipos TypeScript sin emitir archivos |

La última comprobación realizada con `npm.cmd run typecheck` terminó correctamente.

---

## Estado de Git y destino de la rama

El estado observado del repositorio es el siguiente:

| Elemento | Estado |
|---|---|
| Rama local actual | `main` |
| Rama remota de seguimiento | `origin/main` |
| Destino configurado | `main` tira de `origin/main` |
| Cambios locales | Hay archivos modificados y archivos nuevos sin commit |
| Publicación remota | No se ha realizado desde este estado de trabajo |

La relación actual es:

```text
main  →  origin/main
```

Esto significa que la rama local `main` está configurada para seguir a la rama `main` del remoto llamado `origin`. Para comprobarlo en cualquier momento:

```bash
git branch --show-current
git branch -vv
git remote -v
git status --short --branch
```

Antes de subir los cambios, revisa el diff y crea un commit:

```bash
git diff
git add .
git commit -m "feat: add training community forum"
git push origin main
```

El README no afirma que los cambios estén ya subidos: el estado actual detectado es de trabajo local pendiente de commit y push.

---

## Distribuir a amigos

Para Android puedes crear un APK de prueba con EAS:

```bash
npx eas build --platform android --profile preview
```

Para iOS:

```bash
npx eas build --platform ios --profile preview
```

Durante el desarrollo, también puedes compartir el QR de Expo Go con personas que tengan Expo Go instalado.

---

## Roadmap

### Retención

- Gráficos de progreso y récords personales.
- Plantillas prediseñadas.
- Autocompletado del último peso utilizado.
- Historial más detallado de sesiones.

### Comunidad

- Moderación y reportes.
- Edición y eliminación de temas propios desde la interfaz.
- Perfiles públicos ampliados.
- Seguidores y notificaciones.
- Adjuntos de imágenes o vídeos.
- Búsqueda, filtros y ordenación del foro.

### Distribución

- Builds de producción.
- Publicación en App Store y Google Play.
- Configuración de analítica y monitorización.

---

## Licencia

Proyecto personal y educativo. Uso libre para aprendizaje.
