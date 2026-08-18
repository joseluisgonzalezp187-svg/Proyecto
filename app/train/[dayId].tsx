import { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Card, Chip, ProgressBar, Text, TextInput } from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRoutine } from '@/hooks/useExercises';
import { completeSessionSet, finishWorkoutSession, startWorkoutSession } from '@/lib/api/routines';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WorkoutShareButton } from '@/components/WorkoutShareButton';
import { APP_COLORS, APP_RADIUS, APP_SHADOWS, APP_SPACING } from '@/lib/constants';
import { RoutineExercise } from '@/types/database';

type WorkoutRoutineExercise = RoutineExercise & {
  exercise?: { name: string };
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TrainScreen() {
  const { dayId, routineId } = useLocalSearchParams<{ dayId: string; routineId: string }>();
  const { data: routine, isLoading } = useRoutine(routineId);
  const {
    sessionId,
    completedSets,
    isResting,
    restSecondsRemaining,
    startSession,
    endSession,
    completeSet,
    startRest,
    tickRest,
    skipRest,
  } = useWorkoutStore();
  const [started, setStarted] = useState(false);
  const [savingSetKey, setSavingSetKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [timerExerciseName, setTimerExerciseName] = useState<string | null>(null);

  const day = routine?.routine_days?.find((item: { id: string }) => item.id === dayId);
  const exercises = (day?.routine_exercises ?? []) as WorkoutRoutineExercise[];
  const totalSets = useMemo(() => exercises.reduce((total, exercise) => total + exercise.sets, 0), [exercises]);
  const completedCount = useMemo(() => exercises.reduce((total, exercise) => {
    const completedForExercise = completedSets[exercise.exercise_id] ?? [];
    return total + completedForExercise.filter(Boolean).length;
  }, 0), [completedSets, exercises]);
  const activeExerciseIndex = useMemo(() => exercises.findIndex((exercise) => (
    !Array.from({ length: exercise.sets }).every((_, setIndex) => completedSets[exercise.exercise_id]?.[setIndex])
  )), [completedSets, exercises]);
  const progress = totalSets ? completedCount / totalSets : 0;
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0];

  useEffect(() => {
    if (!isResting || restSecondsRemaining <= 0) return;
    const timer = setInterval(tickRest, 1000);
    return () => clearInterval(timer);
  }, [isResting, restSecondsRemaining, tickRest]);

  useEffect(() => {
    if (!started || !sessionStartedAt) return;
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [sessionStartedAt, started]);

  const handleStart = async () => {
    if (!routineId || !dayId || !day) return;
    try {
      setError(null);
      const session = await startWorkoutSession(routineId, dayId);
      startSession(session.id, dayId, day.name);
      setSessionStartedAt(Date.now());
      setElapsedSeconds(0);
      setSelectedExerciseId(exercises[0]?.id ?? null);
      setTimerExerciseName(exercises[0]?.exercise?.name ?? null);
      setStarted(true);
    } catch {
      setError('No se pudo iniciar la sesión. Inténtalo de nuevo.');
    }
  };

  const handleFinish = async () => {
    try {
      if (sessionId) await finishWorkoutSession(sessionId, sessionNotes.trim() || undefined);
      endSession();
      router.back();
    } catch {
      setError('No se pudo finalizar el entreno. Inténtalo de nuevo.');
    }
  };

  const handleSelectExercise = (exerciseId: string) => {
    const exercise = exercises.find((item) => item.id === exerciseId);
    setSelectedExerciseId(exerciseId);
    setTimerExerciseName(exercise?.exercise?.name ?? null);
  };

  const handleStartSelectedTimer = () => {
    if (!selectedExercise) return;
    setTimerExerciseName(selectedExercise.exercise?.name ?? 'Ejercicio');
    startRest(selectedExercise.rest_seconds ?? 90);
  };

  const handleCompleteSet = async (exerciseId: string, setIndex: number, reps: number, weightKg: number, restSeconds: number) => {
    if (!sessionId || completedSets[exerciseId]?.[setIndex]) return;
    const setKey = `${exerciseId}-${setIndex}`;
    setSavingSetKey(setKey);
    setError(null);
    try {
      await completeSessionSet({
        workoutSessionId: sessionId,
        exerciseId,
        setNumber: setIndex + 1,
        reps,
        weightKg,
      });
      completeSet(exerciseId, setIndex);
      setSelectedExerciseId(exercises.find((exercise) => exercise.exercise_id === exerciseId)?.id ?? selectedExerciseId);
      setTimerExerciseName(exercises.find((exercise) => exercise.exercise_id === exerciseId)?.exercise?.name ?? null);
      startRest(restSeconds);
    } catch {
      setError('No se pudo guardar el set. Inténtalo de nuevo.');
    } finally {
      setSavingSetKey(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tu sesión…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: day?.name ?? 'Entrenar', headerStyle: { backgroundColor: APP_COLORS.background }, headerTintColor: APP_COLORS.text }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sessionHeader}>
          <View>
            <Text variant="labelLarge" style={styles.eyebrow}>{started ? 'SESIÓN EN CURSO' : 'LISTO PARA ENTRENAR'}</Text>
            <Text variant="headlineSmall" style={styles.title}>{day?.name ?? 'Tu entrenamiento'}</Text>
          </View>
          <View style={styles.setBadge}>
            <Text style={styles.setBadgeValue}>{completedCount}/{totalSets || 0}</Text>
            <Text style={styles.setBadgeLabel}>SETS</Text>
          </View>
        </View>

        <ImageBackground source={require('../../assets/images/training_focus.jpg')} style={styles.trainingBanner} imageStyle={styles.trainingBannerAsset}>
          <View style={styles.trainingBannerOverlay}>
            <Text variant="labelLarge" style={styles.trainingBannerEyebrow}>{started ? 'MANTÉN EL FOCO' : 'PREPARA TU SESIÓN'}</Text>
            <Text variant="titleMedium" style={styles.trainingBannerTitle}>{started ? 'Cada set cuenta.' : 'Hoy entrenas por ti.'}</Text>
          </View>
        </ImageBackground>

        {!day ? (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={styles.error}>No encontramos el día de entrenamiento.</Text>
            </Card.Content>
          </Card>
        ) : !started ? (
          <Card style={styles.readyCard} mode="elevated">
            <Card.Content>
              <View style={styles.readyIcon}>
                <MaterialCommunityIcons name="dumbbell" size={28} color={APP_COLORS.primary} />
              </View>
              <Text variant="titleLarge" style={styles.readyTitle}>Todo preparado</Text>
              <Text variant="bodyMedium" style={styles.readyText}>
                {exercises.length} ejercicios y {totalSets} sets. Empieza cuando estés listo.
              </Text>
              <View style={styles.readyMeta}>
                <MaterialCommunityIcons name="timer-outline" size={17} color={APP_COLORS.textMuted} />
                <Text style={styles.readyMetaText}>El descanso se inicia al completar cada set</Text>
              </View>
            </Card.Content>
            <Card.Actions style={styles.readyActions}>
              <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} onPress={handleStart} contentStyle={styles.startButtonContent} labelStyle={styles.startButtonLabel} icon="play">
                Empezar sesión
              </Button>
            </Card.Actions>
          </Card>
        ) : (
          <>
            <Card style={styles.progressCard} mode="elevated">
              <Card.Content>
                <View style={styles.progressHeader}>
                  <Text variant="titleMedium" style={styles.progressTitle}>{completedCount === totalSets ? 'Sesión completada' : 'Tu avance'}</Text>
                  <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
                </View>
                <ProgressBar progress={progress} color={APP_COLORS.primary} style={styles.progressBar} />
                <Text style={styles.progressText}>
                  {completedCount === totalSets ? 'Has terminado todos los sets. Gran trabajo.' : `${totalSets - completedCount} ${totalSets - completedCount === 1 ? 'set pendiente' : 'sets pendientes'}`}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.sessionDetailCard} mode="elevated">
              <Card.Content>
                <View style={styles.sessionDetailHeader}>
                  <View style={styles.sessionDuration}>
                    <MaterialCommunityIcons name="timer-outline" size={19} color={APP_COLORS.primary} />
                    <Text style={styles.sessionDurationText}>Duración {formatDuration(elapsedSeconds)}</Text>
                  </View>
                  <Text style={styles.sessionDetailHint}>Se guardará al finalizar</Text>
                </View>
                <TextInput
                  label="Notas de la sesión"
                  value={sessionNotes}
                  onChangeText={setSessionNotes}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Ej. Energía alta, subir carga la próxima vez"
                  style={styles.notesInput}
                  textColor={APP_COLORS.text}
                  outlineColor={APP_COLORS.borderStrong}
                  activeOutlineColor={APP_COLORS.primary}
                  left={<TextInput.Icon icon="notebook-outline" color={APP_COLORS.textMuted} />}
                />
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.activeExerciseSectionTitle}>Ejercicio activo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseSelector}>
              {exercises.map((exercise, index) => {
                const isSelected = selectedExercise?.id === exercise.id;
                return (
                  <Chip key={exercise.id} mode={isSelected ? 'flat' : 'outlined'} selected={isSelected} onPress={() => handleSelectExercise(exercise.id)} style={[styles.exerciseChip, isSelected && styles.exerciseChipSelected]} textStyle={isSelected ? styles.exerciseChipTextSelected : styles.exerciseChipText}>
                    {index + 1}. {exercise.exercise?.name ?? 'Ejercicio'}
                  </Chip>
                );
              })}
            </ScrollView>

            {selectedExercise ? (
              <Card style={styles.activeExerciseCard} mode="elevated">
                <Card.Content>
                  <View style={styles.activeExerciseTopRow}>
                    <View>
                      <Text variant="titleLarge" style={styles.activeExerciseName}>{selectedExercise.exercise?.name ?? 'Ejercicio'}</Text>
                      <Text style={styles.activeExerciseMeta}>{selectedExercise.sets} series · {selectedExercise.reps} reps · {selectedExercise.weight_kg} kg</Text>
                    </View>
                    <View style={styles.restPill}>
                      <MaterialCommunityIcons name="timer-outline" size={16} color={APP_COLORS.primary} />
                      <Text style={styles.restPillText}>{selectedExercise.rest_seconds ?? 90} s</Text>
                    </View>
                  </View>
                  <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} onPress={handleStartSelectedTimer} style={styles.activeTimerButton} contentStyle={styles.activeTimerButtonContent} labelStyle={styles.activeTimerButtonLabel} icon="timer-play-outline">
                    Iniciar temporizador
                  </Button>
                </Card.Content>
              </Card>
            ) : null}

            {isResting ? (
              <Card style={styles.restCard} mode="elevated">
                <Card.Content>
                  <View style={styles.restTopRow}>
                    <View>
                      <Text variant="labelLarge" style={styles.restEyebrow}>CUENTA ATRÁS · {timerExerciseName ?? 'EJERCICIO'}</Text>
                      <Text variant="headlineSmall" style={styles.restTimer}>{restSecondsRemaining}s</Text>
                    </View>
                    <View style={styles.restIcon}>
                      <MaterialCommunityIcons name="timer-sand" size={26} color={APP_COLORS.primary} />
                    </View>
                  </View>
                  <ProgressBar progress={Math.min(restSecondsRemaining / 90, 1)} color={APP_COLORS.primary} style={styles.progressBar} />
                </Card.Content>
                <Card.Actions style={styles.restActions}>
                  <Button mode="text" textColor={APP_COLORS.primary} onPress={skipRest}>Omitir descanso</Button>
                </Card.Actions>
              </Card>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text variant="titleMedium" style={styles.exerciseSectionTitle}>Ejercicios</Text>
            {exercises.map((routineExercise, exerciseIndex) => {
              const isActive = exerciseIndex === activeExerciseIndex;
              const exerciseCompleted = Array.from({ length: routineExercise.sets }).every((_, setIndex) => completedSets[routineExercise.exercise_id]?.[setIndex]);
              return (
                <Card key={routineExercise.id} style={[styles.card, isActive && styles.activeCard, selectedExercise?.id === routineExercise.id && styles.selectedExerciseCard]} mode="elevated" onPress={() => handleSelectExercise(routineExercise.id)}>
                  <Card.Content>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseIndex}><Text style={styles.exerciseIndexText}>{exerciseIndex + 1}</Text></View>
                      <View style={styles.exerciseNameWrap}>
                        <Text variant="titleLarge" style={styles.exerciseTitle}>{routineExercise.exercise?.name ?? 'Ejercicio'}</Text>
                        <Text style={styles.exerciseMeta}>{routineExercise.sets} series · {routineExercise.reps} reps · {routineExercise.weight_kg} kg</Text>
                      </View>
                      {exerciseCompleted ? <MaterialCommunityIcons name="check-circle" size={22} color={APP_COLORS.success} /> : null}
                    </View>

                    {Array.from({ length: routineExercise.sets }).map((_, setIndex) => {
                      const completed = Boolean(completedSets[routineExercise.exercise_id]?.[setIndex]);
                      const setKey = `${routineExercise.exercise_id}-${setIndex}`;
                      return (
                        <View key={setKey} style={[styles.setRow, completed && styles.setRowCompleted]}>
                          <View>
                            <Text style={[styles.setLabel, completed && styles.setLabelCompleted]}>Serie {setIndex + 1}</Text>
                            <Text style={styles.setTarget}>{routineExercise.reps} reps · {routineExercise.weight_kg} kg</Text>
                          </View>
                          <Button
                            mode={completed ? 'contained-tonal' : isActive ? 'contained' : 'outlined'}
                            buttonColor={completed ? undefined : isActive ? APP_COLORS.primary : undefined}
                            textColor={completed ? APP_COLORS.success : isActive ? APP_COLORS.background : APP_COLORS.primary}
                            onPress={() => handleCompleteSet(routineExercise.exercise_id, setIndex, routineExercise.reps, routineExercise.weight_kg, routineExercise.rest_seconds ?? 90)}
                            disabled={savingSetKey !== null || completed}
                            loading={savingSetKey === setKey}
                            icon={completed ? 'check' : undefined}
                            contentStyle={styles.setButtonContent}
                            labelStyle={styles.setButtonLabel}
                            accessibilityLabel={`Marcar como completada la serie ${setIndex + 1} de ${routineExercise.exercise?.name ?? 'ejercicio'}`}
                          >
                            {completed ? 'Hecho' : 'Completar'}
                          </Button>
                        </View>
                      );
                    })}
                  </Card.Content>
                </Card>
              );
            })}

                        <WorkoutShareButton
              routineName={routine?.name ?? 'Entrenamiento'}
              dayName={day?.name ?? 'Sesión'}
              durationSeconds={elapsedSeconds}
              completedSets={completedCount}
              totalSets={totalSets}
              exerciseCount={exercises.length}
            />
<Button mode="contained" buttonColor={APP_COLORS.success} textColor={APP_COLORS.background} onPress={handleFinish} style={styles.finishButton} contentStyle={styles.finishButtonContent} labelStyle={styles.finishButtonLabel} icon="flag-checkered">
              Finalizar entrenamiento
            </Button>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: APP_SPACING.xxxl },
  loadingScreen: { alignItems: 'center', backgroundColor: APP_COLORS.background, flex: 1, gap: APP_SPACING.sm, justifyContent: 'center' },
  loadingText: { color: APP_COLORS.textMuted },
  sessionHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: APP_SPACING.lg },
  trainingBanner: { height: 132, justifyContent: 'flex-end', marginBottom: APP_SPACING.lg, overflow: 'hidden' },
  trainingBannerAsset: { borderRadius: APP_RADIUS.lg, resizeMode: 'cover' },
  trainingBannerOverlay: { backgroundColor: 'rgba(7, 10, 8, 0.64)', padding: APP_SPACING.md },
  trainingBannerEyebrow: { color: APP_COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  trainingBannerTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.xxs },
  eyebrow: { color: APP_COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: APP_SPACING.xs },
  title: { color: APP_COLORS.text, fontWeight: '800', letterSpacing: -0.5 },
  setBadge: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.md, minWidth: 58, paddingHorizontal: APP_SPACING.sm, paddingVertical: APP_SPACING.xs },
  setBadgeValue: { color: APP_COLORS.primary, fontSize: 17, fontWeight: '800' },
  setBadgeLabel: { color: APP_COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  card: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.xl, borderWidth: 1, marginBottom: APP_SPACING.md },
  activeCard: { borderColor: APP_COLORS.primary },
  selectedExerciseCard: { borderColor: APP_COLORS.info },
  readyCard: { ...APP_SHADOWS.card, backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  readyIcon: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, height: 58, justifyContent: 'center', width: 58 },
  readyTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.md },
  readyText: { color: APP_COLORS.textMuted, lineHeight: 21, marginTop: APP_SPACING.xs },
  readyMeta: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs, marginTop: APP_SPACING.lg },
  readyMetaText: { color: APP_COLORS.textMuted, fontSize: 13 },
  readyActions: { borderTopColor: APP_COLORS.border, borderTopWidth: 1, padding: APP_SPACING.sm },
  startButtonContent: { minHeight: 48, paddingHorizontal: APP_SPACING.md },
  startButtonLabel: { fontWeight: '800' },
  progressCard: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.md },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { color: APP_COLORS.text, fontWeight: '800' },
  progressValue: { color: APP_COLORS.primary, fontWeight: '800' },
  progressBar: { backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.pill, height: 8, marginTop: APP_SPACING.sm },
  progressText: { color: APP_COLORS.textMuted, fontSize: 13, marginTop: APP_SPACING.sm },
  sessionDetailCard: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.md },
  sessionDetailHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: APP_SPACING.sm },
  sessionDuration: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs },
  sessionDurationText: { color: APP_COLORS.text, fontWeight: '800' },
  sessionDetailHint: { color: APP_COLORS.textSubtle, fontSize: 11 },
  notesInput: { backgroundColor: APP_COLORS.surface },
  activeExerciseSectionTitle: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm },
  exerciseSelector: { gap: APP_SPACING.xs, marginBottom: APP_SPACING.md, paddingRight: APP_SPACING.md },
  exerciseChip: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.pill },
  exerciseChipSelected: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  exerciseChipText: { color: APP_COLORS.textMuted, fontWeight: '700' },
  exerciseChipTextSelected: { color: APP_COLORS.background, fontWeight: '800' },
  activeExerciseCard: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.primary, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.md },
  activeExerciseTopRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  activeExerciseName: { color: APP_COLORS.text, fontWeight: '800' },
  activeExerciseMeta: { color: APP_COLORS.textMuted, fontSize: 13, marginTop: APP_SPACING.xxs },
  restPill: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, flexDirection: 'row', gap: APP_SPACING.xxs, paddingHorizontal: APP_SPACING.sm, paddingVertical: APP_SPACING.xs },
  restPillText: { color: APP_COLORS.primary, fontWeight: '800' },
  activeTimerButton: { marginTop: APP_SPACING.md },
  activeTimerButtonContent: { minHeight: 46 },
  activeTimerButtonLabel: { fontWeight: '800' },
  restCard: { backgroundColor: '#202D17', borderColor: '#40611F', borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.md },
  restTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  restEyebrow: { color: APP_COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.9 },
  restTimer: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.xxs },
  restIcon: { alignItems: 'center', backgroundColor: '#30451D', borderRadius: APP_RADIUS.pill, height: 48, justifyContent: 'center', width: 48 },
  restActions: { paddingHorizontal: APP_SPACING.sm, paddingTop: 0 },
  error: { color: APP_COLORS.error, lineHeight: 21, marginBottom: APP_SPACING.md, textAlign: 'center' },
  exerciseSectionTitle: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm },
  exerciseHeader: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.sm, marginBottom: APP_SPACING.sm },
  exerciseIndex: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.pill, height: 30, justifyContent: 'center', width: 30 },
  exerciseIndexText: { color: APP_COLORS.primary, fontWeight: '800' },
  exerciseNameWrap: { flex: 1 },
  exerciseTitle: { color: APP_COLORS.text, fontWeight: '800' },
  exerciseMeta: { color: APP_COLORS.textMuted, fontSize: 13, marginTop: APP_SPACING.xxs },
  setRow: { alignItems: 'center', borderTopColor: APP_COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: APP_SPACING.sm },
  setRowCompleted: { opacity: 0.72 },
  setLabel: { color: APP_COLORS.text, fontWeight: '700' },
  setLabelCompleted: { color: APP_COLORS.success },
  setTarget: { color: APP_COLORS.textMuted, fontSize: 13, marginTop: APP_SPACING.xxs },
  setButtonContent: { minHeight: 38 },
  setButtonLabel: { fontSize: 12, fontWeight: '800' },
  finishButton: { marginTop: APP_SPACING.sm },
  finishButtonContent: { minHeight: 52 },
  finishButtonLabel: { fontWeight: '800' },
});
