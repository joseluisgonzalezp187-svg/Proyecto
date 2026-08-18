import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button, ActivityIndicator, Card } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useRoutine } from '@/hooks/useExercises';
import { APP_COLORS, GOAL_LABELS } from '@/lib/constants';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading, error } = useRoutine(id);

  if (isLoading) {
    return <ActivityIndicator color={APP_COLORS.primary} style={styles.loader} />;
  }

  if (error || !routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No se pudo cargar la rutina</Text>
      </View>
    );
  }

  const days = (routine.routine_days ?? []).sort(
    (a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number
  );

  return (
    <>
      <Stack.Screen options={{ title: routine.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {routine.goal ? (
          <Text style={styles.goal}>{GOAL_LABELS[routine.goal]}</Text>
        ) : null}
        <Text style={styles.meta}>
          {routine.days_per_week} días / semana
        </Text>

        {days.map((day: { id: string; day_number: number; name: string; routine_exercises?: Array<{ sets: number; reps: number; weight_kg: number; exercise?: { name: string } }> }) => (
          <Card key={day.id} style={styles.card} mode="elevated">
            <Card.Title title={day.name} titleStyle={styles.dayTitle} />
            <Card.Content>
              {(day.routine_exercises ?? []).map((re, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>
                    {re.exercise?.name ?? 'Ejercicio'}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {re.sets} series × {re.reps} reps · {re.weight_kg} kg
                  </Text>
                </View>
              ))}
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor={APP_COLORS.primary}
                onPress={() => router.push(`/train/${day.id}?routineId=${id}`)}
              >
                Entrenar este día
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 20 },
  loader: { flex: 1, marginTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS.background },
  error: { color: APP_COLORS.error },
  goal: { color: APP_COLORS.primary, fontWeight: '600', marginBottom: 4 },
  meta: { color: APP_COLORS.textMuted, marginBottom: 20 },
  card: { backgroundColor: APP_COLORS.surface, marginBottom: 16 },
  dayTitle: { color: APP_COLORS.text },
  exerciseRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: APP_COLORS.background },
  exerciseName: { color: APP_COLORS.text, fontWeight: '500' },
  exerciseMeta: { color: APP_COLORS.textMuted, marginTop: 2 },
});
