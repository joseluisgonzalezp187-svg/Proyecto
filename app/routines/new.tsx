import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Card, Chip, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useExercises } from '@/hooks/useExercises';
import { createRoutine } from '@/lib/api/routines';
import { APP_COLORS, APP_RADIUS, APP_SPACING, DEFAULT_REST_SECONDS, GOAL_LABELS, MAX_DAYS_PER_WEEK, MIN_DAYS_PER_WEEK, MUSCLE_GROUP_LABELS } from '@/lib/constants';
import { createRoutineSchema } from '@/lib/validators/routines';
import { CreateRoutineInput, EquipmentType, MuscleGroup, RoutineGoal } from '@/types/database';

type DayDraft = CreateRoutineInput['days'][number];

const ROUTINE_PRESETS: Array<{ id: string; title: string; detail: string; name: string; days: string; goal: RoutineGoal }> = [
  { id: 'strength', title: 'Fuerza', detail: '3 días · básicos', name: 'Fuerza total', days: '3', goal: 'fuerza' },
  { id: 'hypertrophy', title: 'Hipertrofia', detail: '4 días · volumen', name: 'Hipertrofia 4 días', days: '4', goal: 'hipertrofia' },
  { id: 'beginner', title: 'Empezar', detail: '3 días · simple', name: 'Base de entrenamiento', days: '3', goal: 'general' },
];

export default function NewRoutineScreen() {
  const { data: exercises = [], isLoading: exercisesLoading, error: exercisesError } = useExercises();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [goal, setGoal] = useState<RoutineGoal>('hipertrofia');
  const [days, setDays] = useState<DayDraft[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'todos'>('todos');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'todos'>('todos');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [restSeconds, setRestSeconds] = useState('90');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentDayData = days.find((day) => day.day_number === currentDay);
  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return exercises.filter((exercise) => {
      const haystack = `${exercise.name} ${MUSCLE_GROUP_LABELS[exercise.muscle_group]} ${exercise.equipment}`.toLocaleLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesMuscle = muscleFilter === 'todos' || exercise.muscle_group === muscleFilter;
      const matchesEquipment = equipmentFilter === 'todos' || exercise.equipment === equipmentFilter;
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [equipmentFilter, exercises, muscleFilter, search]);
  const selectedExerciseData = exercises.find((exercise) => exercise.id === selectedExercise);
  const alternatives = selectedExerciseData
    ? exercises.filter((exercise) => exercise.id !== selectedExerciseData.id && exercise.muscle_group === selectedExerciseData.muscle_group).slice(0, 3)
    : [];

  const applyPreset = (preset: typeof ROUTINE_PRESETS[number]) => {
    setName(preset.name);
    setDaysPerWeek(preset.days);
    setGoal(preset.goal);
    setError('');
  };

  const initDays = () => {
    const count = Number.parseInt(daysPerWeek, 10);
    if (!name.trim()) {
      setError('Ponle un nombre a tu rutina para continuar.');
      return;
    }
    if (!Number.isInteger(count) || count < MIN_DAYS_PER_WEEK || count > MAX_DAYS_PER_WEEK) {
      setError(`Elige entre ${MIN_DAYS_PER_WEEK} y ${MAX_DAYS_PER_WEEK} días por semana.`);
      return;
    }

    setError('');
    setDays(Array.from({ length: count }, (_, index) => ({
      day_number: index + 1,
      name: `Día ${index + 1}`,
      exercises: [],
    })));
    setCurrentDay(1);
    setStep(2);
  };

  const addExerciseToDay = () => {
    if (!selectedExercise) {
      setError('Selecciona un ejercicio antes de añadirlo.');
      return;
    }

    setError('');
    setDays((previousDays) => previousDays.map((day) => (
      day.day_number === currentDay
        ? {
            ...day,
            exercises: [
              ...day.exercises,
              {
                exercise_id: selectedExercise,
                sets: Number.parseInt(sets, 10) || 3,
                reps: Number.parseInt(reps, 10) || 10,
                weight_kg: Number.parseFloat(weight.replace(',', '.')) || 0,
                rest_seconds: Number.parseInt(restSeconds, 10) || DEFAULT_REST_SECONDS,
              },
            ],
          }
        : day
    )));
    setSelectedExercise(null);
  };

  const removeExerciseFromDay = (indexToRemove: number) => {
    setDays((previousDays) => previousDays.map((day) => (
      day.day_number === currentDay
        ? { ...day, exercises: day.exercises.filter((_, index) => index !== indexToRemove) }
        : day
    )));
  };

  const handleSave = async () => {
    const input: CreateRoutineInput = {
      name: name.trim(),
      days_per_week: Number.parseInt(daysPerWeek, 10),
      goal,
      days,
    };
    const parsed = createRoutineSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa la configuración de la rutina.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const routine = await createRoutine(parsed.data);
      router.replace(`/routines/${routine.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la rutina. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nueva rutina', headerStyle: { backgroundColor: APP_COLORS.background }, headerTintColor: APP_COLORS.text }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, step === 2 && styles.progressActive]} />
        </View>

        {step === 1 ? (
          <>
            <ScreenHeader eyebrow="PASO 1 DE 2" title="Construye tu base" subtitle="Define la intención de tu rutina. Después elegiremos los ejercicios." />
            <Text variant="labelLarge" style={styles.presetLabel}>EMPIEZA CON UNA PLANTILLA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
              {ROUTINE_PRESETS.map((preset) => (
                <Chip key={preset.id} mode="outlined" onPress={() => applyPreset(preset)} style={styles.presetChip} textStyle={styles.presetChipText} icon="lightning-bolt-outline">
                  {preset.title} · {preset.detail}
                </Chip>
              ))}
            </ScrollView>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <TextInput
                  label="Nombre de la rutina"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  placeholder="Ej. Fuerza 3 días"
                  style={styles.input}
                  textColor={APP_COLORS.text}
                  outlineColor={APP_COLORS.borderStrong}
                  activeOutlineColor={APP_COLORS.primary}
                  left={<TextInput.Icon icon="pencil-outline" color={APP_COLORS.textMuted} />}
                />
                <Text variant="labelLarge" style={styles.label}>Días por semana</Text>
                <SegmentedButtons
                  value={daysPerWeek}
                  onValueChange={setDaysPerWeek}
                  buttons={['2', '3', '4', '5', '6'].map((value) => ({ value, label: value }))}
                  style={styles.segmented}
                />
                <Text variant="labelLarge" style={styles.label}>Objetivo principal</Text>
                <SegmentedButtons
                  value={goal}
                  onValueChange={(value) => setGoal(value as RoutineGoal)}
                  buttons={(Object.keys(GOAL_LABELS) as RoutineGoal[]).map((value) => ({ value, label: GOAL_LABELS[value] }))}
                  style={styles.goalButtons}
                />
              </Card.Content>
            </Card>
            <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} onPress={initDays} style={styles.primaryButton} contentStyle={styles.buttonContent} labelStyle={styles.primaryLabel} icon="arrow-right">
              Elegir ejercicios
            </Button>
          </>
        ) : (
          <>
            <ScreenHeader eyebrow="PASO 2 DE 2" title="Completa tu plan" subtitle="Añade ejercicios a cada día. Puedes cambiar entre días cuando quieras." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
              {days.map((day) => {
                const isSelected = day.day_number === currentDay;
                return (
                  <Chip key={day.day_number} selected={isSelected} mode={isSelected ? 'flat' : 'outlined'} onPress={() => setCurrentDay(day.day_number)} style={[styles.dayChip, isSelected && styles.dayChipSelected]} textStyle={isSelected ? styles.dayChipTextSelected : styles.dayChipText}>
                    Día {day.day_number} · {day.exercises.length}
                  </Chip>
                );
              })}
            </ScrollView>

            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <View style={styles.dayTitleRow}>
                  <View>
                    <Text variant="titleLarge" style={styles.dayTitle}>Día {currentDay}</Text>
                    <Text variant="bodySmall" style={styles.daySubtitle}>{currentDayData?.exercises.length ?? 0} ejercicios añadidos</Text>
                  </View>
                  <MaterialCommunityIcons name="calendar-edit" size={24} color={APP_COLORS.primary} />
                </View>

                <TextInput
                  label="Buscar ejercicio"
                  value={search}
                  onChangeText={setSearch}
                  mode="outlined"
                  placeholder="Nombre, grupo muscular o equipo"
                  style={styles.input}
                  textColor={APP_COLORS.text}
                  outlineColor={APP_COLORS.borderStrong}
                  activeOutlineColor={APP_COLORS.primary}
                  left={<TextInput.Icon icon="magnify" color={APP_COLORS.textMuted} />}
                />

                <Text variant="labelLarge" style={styles.filterLabel}>Filtrar por grupo muscular</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  <Chip mode={muscleFilter === 'todos' ? 'flat' : 'outlined'} selected={muscleFilter === 'todos'} onPress={() => setMuscleFilter('todos')} style={[styles.filterChip, muscleFilter === 'todos' && styles.filterChipSelected]} textStyle={muscleFilter === 'todos' ? styles.filterChipTextSelected : styles.filterChipText}>Todos</Chip>
                  {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((group) => (
                    <Chip key={group} mode={muscleFilter === group ? 'flat' : 'outlined'} selected={muscleFilter === group} onPress={() => setMuscleFilter(group)} style={[styles.filterChip, muscleFilter === group && styles.filterChipSelected]} textStyle={muscleFilter === group ? styles.filterChipTextSelected : styles.filterChipText}>{MUSCLE_GROUP_LABELS[group]}</Chip>
                  ))}
                </ScrollView>
                <Text variant="labelLarge" style={styles.filterLabel}>Equipamiento disponible</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  <Chip mode={equipmentFilter === 'todos' ? 'flat' : 'outlined'} selected={equipmentFilter === 'todos'} onPress={() => setEquipmentFilter('todos')} style={[styles.filterChip, equipmentFilter === 'todos' && styles.filterChipSelected]} textStyle={equipmentFilter === 'todos' ? styles.filterChipTextSelected : styles.filterChipText}>Todo</Chip>
                  {(['barra', 'mancuernas', 'maquina', 'polea', 'peso_corporal'] as EquipmentType[]).map((equipment) => (
                    <Chip key={equipment} mode={equipmentFilter === equipment ? 'flat' : 'outlined'} selected={equipmentFilter === equipment} onPress={() => setEquipmentFilter(equipment)} style={[styles.filterChip, equipmentFilter === equipment && styles.filterChipSelected]} textStyle={equipmentFilter === equipment ? styles.filterChipTextSelected : styles.filterChipText}>{equipment.replace('_', ' ')}</Chip>
                  ))}
                </ScrollView>

                {exercisesLoading ? <ActivityIndicator color={APP_COLORS.primary} style={styles.catalogLoader} /> : null}
                {exercisesError ? <Text style={styles.errorText}>No se pudo cargar el catálogo de ejercicios.</Text> : null}
                {!exercisesLoading && !exercisesError ? (
                  <View style={styles.exerciseChoices}>
                    {filteredExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} selected={selectedExercise === exercise.id} onPress={() => setSelectedExercise(exercise.id)} />
                    ))}
                    {filteredExercises.length === 0 ? <Text style={styles.emptyCatalog}>No encontramos ejercicios con esa búsqueda.</Text> : null}
                  </View>
                ) : null}

                {selectedExerciseData && alternatives.length > 0 ? (
                  <View style={styles.alternatives}>
                    <Text variant="labelSmall" style={styles.alternativesTitle}>ALTERNATIVAS PARA {MUSCLE_GROUP_LABELS[selectedExerciseData.muscle_group].toUpperCase()}</Text>
                    <Text style={styles.alternativesText}>{alternatives.map((exercise) => exercise.name).join(' · ')}</Text>
                  </View>
                ) : null}

                <Text variant="labelLarge" style={styles.label}>Configuración del ejercicio</Text>
                <View style={styles.metricsRow}>
                  <TextInput label="Series" value={sets} onChangeText={setSets} keyboardType="numeric" mode="outlined" style={styles.metricInput} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} />
                  <TextInput label="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" mode="outlined" style={styles.metricInput} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} />
                  <TextInput label="Peso kg" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" mode="outlined" style={styles.metricInput} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} />
                </View>
                <Text variant="labelLarge" style={styles.restLabel}>Descanso entre series</Text>
                <SegmentedButtons value={restSeconds} onValueChange={setRestSeconds} buttons={[{ value: '60', label: '60 s' }, { value: '90', label: '90 s' }, { value: '120', label: '120 s' }]} style={styles.restSelector} />
                <Button mode="outlined" textColor={APP_COLORS.primary} onPress={addExerciseToDay} style={styles.addButton} icon="plus">
                  Añadir al día {currentDay}
                </Button>
              </Card.Content>
            </Card>

            {currentDayData?.exercises.length ? (
              <Card style={styles.card} mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium" style={styles.addedTitle}>Tu día {currentDay}</Text>
                  {currentDayData.exercises.map((entry, index) => {
                    const exercise = exercises.find((item) => item.id === entry.exercise_id);
                    return (
                      <View key={`${entry.exercise_id}-${index}`} style={styles.addedExercise}>
                        <View style={styles.addedExerciseCopy}>
                          <Text style={styles.addedExerciseName}>{exercise?.name ?? 'Ejercicio'}</Text>
                          <Text style={styles.addedExerciseMeta}>{entry.sets} series × {entry.reps} reps · {entry.weight_kg} kg</Text>
                        </View>
                        <Button compact mode="text" textColor={APP_COLORS.error} onPress={() => removeExerciseFromDay(index)} accessibilityLabel={`Eliminar ${exercise?.name ?? 'ejercicio'}`}>
                          Quitar
                        </Button>
                      </View>
                    );
                  })}
                </Card.Content>
              </Card>
            ) : null}

            <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} onPress={handleSave} loading={loading} disabled={loading} style={styles.primaryButton} contentStyle={styles.buttonContent} labelStyle={styles.primaryLabel} icon="check">
              Guardar rutina
            </Button>
            <Button mode="text" textColor={APP_COLORS.textMuted} onPress={() => setStep(1)} style={styles.backButton}>Volver a la configuración</Button>
          </>
        )}
        <HelperText type="error" visible={Boolean(error)} style={styles.errorText}>{error}</HelperText>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: APP_SPACING.xxxl },
  progressRow: { flexDirection: 'row', gap: APP_SPACING.xs, marginBottom: APP_SPACING.lg },
  progressSegment: { backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.pill, flex: 1, height: 6 },
  progressActive: { backgroundColor: APP_COLORS.primary },
  presetLabel: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: APP_SPACING.xs },
  presetRow: { gap: APP_SPACING.xs, marginBottom: APP_SPACING.md, paddingRight: APP_SPACING.md },
  presetChip: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.pill },
  presetChipText: { color: APP_COLORS.primary, fontWeight: '700' },
  card: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.xl, borderWidth: 1, marginBottom: APP_SPACING.md },
  input: { backgroundColor: APP_COLORS.surface, marginBottom: APP_SPACING.lg },
  label: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm },
  segmented: { marginBottom: APP_SPACING.lg },
  goalButtons: { marginBottom: APP_SPACING.xs },
  primaryButton: { marginTop: APP_SPACING.sm },
  buttonContent: { minHeight: 50 },
  primaryLabel: { fontWeight: '800' },
  dayTabs: { gap: APP_SPACING.xs, marginBottom: APP_SPACING.md, paddingRight: APP_SPACING.md },
  dayChip: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.pill },
  dayChipSelected: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  dayChipText: { color: APP_COLORS.textMuted },
  dayChipTextSelected: { color: APP_COLORS.background, fontWeight: '800' },
  dayTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: APP_SPACING.md },
  dayTitle: { color: APP_COLORS.text, fontWeight: '800' },
  daySubtitle: { color: APP_COLORS.textMuted, marginTop: APP_SPACING.xxs },
  filterLabel: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginBottom: APP_SPACING.xs },
  filterRow: { gap: APP_SPACING.xs, marginBottom: APP_SPACING.md, paddingRight: APP_SPACING.md },
  filterChip: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.pill },
  filterChipSelected: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  filterChipText: { color: APP_COLORS.textMuted, fontWeight: '700' },
  filterChipTextSelected: { color: APP_COLORS.background, fontWeight: '800' },
  catalogLoader: { marginVertical: APP_SPACING.md },
  exerciseChoices: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: APP_SPACING.lg },
  emptyCatalog: { color: APP_COLORS.textMuted, lineHeight: 20, marginBottom: APP_SPACING.md },
  alternatives: { backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.md, marginBottom: APP_SPACING.md, padding: APP_SPACING.sm },
  alternativesTitle: { color: APP_COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  alternativesText: { color: APP_COLORS.textMuted, lineHeight: 19, marginTop: APP_SPACING.xxs },
  metricsRow: { flexDirection: 'row', gap: APP_SPACING.xs },
  metricInput: { backgroundColor: APP_COLORS.surface, flex: 1 },
  restLabel: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm, marginTop: APP_SPACING.md },
  restSelector: { marginBottom: APP_SPACING.xs },
  addButton: { borderColor: APP_COLORS.primary, marginTop: APP_SPACING.md },
  addedTitle: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm },
  addedExercise: { alignItems: 'center', borderTopColor: APP_COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: APP_SPACING.sm, justifyContent: 'space-between', paddingVertical: APP_SPACING.sm },
  addedExerciseCopy: { flex: 1 },
  addedExerciseName: { color: APP_COLORS.text, fontWeight: '700' },
  addedExerciseMeta: { color: APP_COLORS.textMuted, fontSize: 13, marginTop: APP_SPACING.xxs },
  backButton: { marginTop: APP_SPACING.xs },
  errorText: { color: APP_COLORS.error, marginTop: APP_SPACING.xs },
});
