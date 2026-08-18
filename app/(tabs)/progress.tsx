import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useWorkoutProgress } from '@/hooks/useExercises';
import { APP_COLORS, APP_RADIUS, APP_SPACING } from '@/lib/constants';

interface ExerciseRecord {
  name: string;
  bestWeight: number;
  bestReps: number;
  estimatedOneRepMax: number;
  volume: number;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(value));
}

function getEstimatedOneRepMax(weightKg: number, reps: number) {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSessionVolume(session: { session_sets: Array<{ completed: boolean; weight_kg: number; reps: number }> }) {
  return session.session_sets
    .filter((set) => set.completed)
    .reduce((total, set) => total + set.weight_kg * set.reps, 0);
}

export default function ProgressScreen() {
  const { data: sessions = [], isLoading, error } = useWorkoutProgress();
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const weeklyVolume = sessions
    .filter((session) => new Date(session.started_at).getTime() >= sevenDaysAgo)
    .reduce((total, session) => total + getSessionVolume(session), 0);
  const previousWeeklyVolume = sessions
    .filter((session) => {
      const timestamp = new Date(session.started_at).getTime();
      return timestamp >= fourteenDaysAgo && timestamp < sevenDaysAgo;
    })
    .reduce((total, session) => total + getSessionVolume(session), 0);
  const volumeTrend = previousWeeklyVolume > 0 ? Math.round(((weeklyVolume - previousWeeklyVolume) / previousWeeklyVolume) * 100) : null;

  const activityDateKeys = new Set(
    sessions
      .filter((session) => new Date(session.started_at).getTime() >= now - 30 * 24 * 60 * 60 * 1000)
      .map((session) => toLocalDateKey(new Date(session.started_at))),
  );
  const activeDays = activityDateKeys.size;
  const mondayOffset = (today.getDay() + 6) % 7;
  const calendarStart = new Date(today);
  calendarStart.setDate(today.getDate() - mondayOffset - 21);
  const calendarDays = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
  const weekDayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const records = Object.values(sessions.reduce<Record<string, ExerciseRecord>>((accumulator, session) => {
    session.session_sets.filter((set) => set.completed && set.exercise).forEach((set) => {
      const current = accumulator[set.exercise_id];
      const estimatedOneRepMax = getEstimatedOneRepMax(set.weight_kg, set.reps);
      const setVolume = set.weight_kg * set.reps;
      if (!current) {
        accumulator[set.exercise_id] = {
          name: set.exercise?.name ?? 'Ejercicio',
          bestWeight: set.weight_kg,
          bestReps: set.reps,
          estimatedOneRepMax,
          volume: setVolume,
        };
        return;
      }
      accumulator[set.exercise_id] = {
        ...current,
        bestWeight: Math.max(current.bestWeight, set.weight_kg),
        bestReps: set.weight_kg >= current.bestWeight ? set.reps : current.bestReps,
        estimatedOneRepMax: Math.max(current.estimatedOneRepMax, estimatedOneRepMax),
        volume: current.volume + setVolume,
      };
    });
    return accumulator;
  }, {})).sort((first, second) => second.estimatedOneRepMax - first.estimatedOneRepMax);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="TUS MÉTRICAS" title="Progreso real" subtitle="Cada sesión registrada construye una señal más clara de tu evolución." />
      <ImageBackground source={require('../../assets/images/progress_strength.jpg')} style={styles.progressBanner} imageStyle={styles.progressBannerAsset}>
        <View style={styles.progressBannerOverlay}>
          <Text variant="labelLarge" style={styles.progressBannerEyebrow}>REGISTRA · REVISA · PROGRESA</Text>
          <Text variant="titleMedium" style={styles.progressBannerTitle}>La constancia también se entrena.</Text>
        </View>
      </ImageBackground>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={APP_COLORS.primary} />
          <Text style={styles.loaderText}>Calculando tu progreso…</Text>
        </View>
      ) : null}

      {error ? (
        <EmptyState icon="cloud-off-outline" title="No pudimos cargar tu progreso" description="Revisa tu conexión y vuelve a intentarlo." />
      ) : null}

      {!isLoading && !error && sessions.length === 0 ? (
        <EmptyState
          icon="chart-line-variant"
          title="Tu progreso empieza con un set"
          description="Registra un entrenamiento para desbloquear volumen, récords personales y tu 1RM estimado."
          actionLabel="Ir a mis rutinas"
          onAction={() => router.push('/(tabs)/routines')}
        />
      ) : null}

      {!isLoading && !error && sessions.length > 0 ? (
        <>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <MaterialCommunityIcons name="calendar-check-outline" size={20} color={APP_COLORS.primary} />
                <Text variant="displaySmall" style={styles.statValue}>{sessions.length}</Text>
                <Text variant="labelLarge" style={styles.statLabel}>SESIONES</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <MaterialCommunityIcons name="weight-kilogram" size={20} color={APP_COLORS.primary} />
                <Text variant="titleLarge" style={styles.statValue}>{Math.round(weeklyVolume)} kg</Text>
                <Text variant="labelLarge" style={styles.statLabel}>VOLUMEN 7 DÍAS</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <MaterialCommunityIcons name="fire" size={20} color={APP_COLORS.warning} />
                <Text variant="displaySmall" style={styles.statValue}>{activeDays}</Text>
                <Text variant="labelLarge" style={styles.statLabel}>DÍAS ACTIVOS</Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.trendCard} mode="elevated">
            <Card.Content style={styles.trendContent}>
              <View style={styles.trendIcon}>
                <MaterialCommunityIcons name={volumeTrend !== null && volumeTrend < 0 ? 'trending-down' : 'trending-up'} size={24} color={volumeTrend !== null && volumeTrend < 0 ? APP_COLORS.warning : APP_COLORS.success} />
              </View>
              <View style={styles.trendCopy}>
                <Text variant="titleSmall" style={styles.trendTitle}>Volumen semanal</Text>
                <Text variant="bodySmall" style={styles.trendText}>
                  {volumeTrend === null
                    ? 'Completa otra semana para comparar tu volumen.'
                    : volumeTrend >= 0
                      ? `${volumeTrend}% más volumen que la semana anterior.`
                      : `${Math.abs(volumeTrend)}% menos volumen que la semana anterior.`}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Text variant="titleMedium" style={styles.sectionTitle}>Constancia · últimas 4 semanas</Text>
          <Card style={styles.calendarCard} mode="elevated">
            <Card.Content>
              <View style={styles.calendarHeading}>
                <Text style={styles.calendarTitle}>{activeDays} {activeDays === 1 ? 'día activo' : 'días activos'} en 30 días</Text>
                <View style={styles.calendarLegend}>
                  <View style={styles.calendarLegendDot} />
                  <Text style={styles.calendarLegendText}>Entrenaste</Text>
                </View>
              </View>
              <View style={styles.calendarWeekHeader}>
                {weekDayLabels.map((label) => <Text key={label} style={styles.calendarWeekLabel}>{label}</Text>)}
              </View>
              <View style={styles.calendarGrid}>
                {calendarDays.map((date) => {
                  const dateKey = toLocalDateKey(date);
                  const isActive = activityDateKeys.has(dateKey);
                  return (
                    <View key={dateKey} style={styles.calendarDayWrap}>
                      <View style={[styles.calendarDay, isActive && styles.calendarDayActive]}>
                        <Text style={[styles.calendarDayText, isActive && styles.calendarDayTextActive]}>{date.getDate()}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card.Content>
          </Card>

          <Text variant="titleMedium" style={styles.sectionTitle}>Récords personales</Text>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              {records.slice(0, 5).map((record, index) => (
                <View key={`${record.name}-${index}`} style={[styles.recordRow, index === 0 ? styles.firstRecordRow : undefined]}>
                  <View style={styles.recordRank}><Text style={styles.recordRankText}>{index + 1}</Text></View>
                  <View style={styles.recordCopy}>
                    <Text style={styles.recordName}>{record.name}</Text>
                    <Text style={styles.recordMeta}>Mejor set: {record.bestWeight} kg × {record.bestReps} reps</Text>
                  </View>
                  <View style={styles.oneRepMax}>
                    <Text style={styles.oneRepMaxValue}>{Math.round(record.estimatedOneRepMax)} kg</Text>
                    <Text style={styles.oneRepMaxLabel}>1RM EST.</Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Text variant="titleMedium" style={styles.sectionTitle}>Actividad reciente</Text>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              {sessions.slice(0, 5).map((session, index) => {
                const volume = getSessionVolume(session);
                const completedSets = session.session_sets.filter((set) => set.completed).length;
                return (
                  <View key={session.id} style={[styles.activityRow, index === 0 ? styles.firstActivityRow : undefined]}>
                    <View style={styles.activityDate}>
                      <Text style={styles.activityDateText}>{formatDate(session.started_at)}</Text>
                    </View>
                    <View style={styles.recordCopy}>
                      <Text style={styles.activityTitle}>{completedSets} {completedSets === 1 ? 'set completado' : 'sets completados'}</Text>
                      <Text style={styles.recordMeta}>{Math.round(volume)} kg de volumen</Text>
                      {session.notes ? <Text style={styles.sessionNote} numberOfLines={1}>{session.notes}</Text> : null}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={APP_COLORS.textSubtle} />
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: APP_SPACING.xxxl },
  progressBanner: { height: 140, justifyContent: 'flex-end', marginBottom: APP_SPACING.lg, overflow: 'hidden' },
  progressBannerAsset: { borderRadius: APP_RADIUS.lg, resizeMode: 'cover' },
  progressBannerOverlay: { backgroundColor: 'rgba(7, 10, 8, 0.64)', padding: APP_SPACING.md },
  progressBannerEyebrow: { color: APP_COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  progressBannerTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.xxs },
  loader: { alignItems: 'center', gap: APP_SPACING.sm, justifyContent: 'center', marginVertical: APP_SPACING.xxxl },
  loaderText: { color: APP_COLORS.textMuted },
  statsGrid: { flexDirection: 'row', gap: APP_SPACING.xs, marginBottom: APP_SPACING.md },
  statCard: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.lg, borderWidth: 1, flex: 1 },
  statValue: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.sm },
  statLabel: { color: APP_COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.55, marginTop: APP_SPACING.xxs },
  trendCard: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.xl },
  trendContent: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.sm },
  trendIcon: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.pill, height: 42, justifyContent: 'center', width: 42 },
  trendCopy: { flex: 1 },
  trendTitle: { color: APP_COLORS.text, fontWeight: '800' },
  trendText: { color: APP_COLORS.textMuted, lineHeight: 19, marginTop: APP_SPACING.xxs },
  sectionTitle: { color: APP_COLORS.text, fontWeight: '800', marginBottom: APP_SPACING.sm },
  calendarCard: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.xl },
  calendarHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: APP_SPACING.md },
  calendarTitle: { color: APP_COLORS.text, fontSize: 13, fontWeight: '700' },
  calendarLegend: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xxs },
  calendarLegendDot: { backgroundColor: APP_COLORS.primary, borderRadius: APP_RADIUS.pill, height: 8, width: 8 },
  calendarLegendText: { color: APP_COLORS.textMuted, fontSize: 11 },
  calendarWeekHeader: { flexDirection: 'row', marginBottom: APP_SPACING.xs },
  calendarWeekLabel: { color: APP_COLORS.textSubtle, fontSize: 10, fontWeight: '800', textAlign: 'center', width: '14.2857%' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayWrap: { alignItems: 'center', marginBottom: APP_SPACING.xs, width: '14.2857%' },
  calendarDay: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.sm, height: 31, justifyContent: 'center', width: 31 },
  calendarDayActive: { backgroundColor: APP_COLORS.primary },
  calendarDayText: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  calendarDayTextActive: { color: APP_COLORS.background },
  card: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border, borderRadius: APP_RADIUS.lg, borderWidth: 1, marginBottom: APP_SPACING.xl },
  recordRow: { alignItems: 'center', borderTopColor: APP_COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: APP_SPACING.sm, paddingVertical: APP_SPACING.sm },
  firstRecordRow: { borderTopWidth: 0, paddingTop: 0 },
  recordRank: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.pill, height: 28, justifyContent: 'center', width: 28 },
  recordRankText: { color: APP_COLORS.primary, fontSize: 12, fontWeight: '800' },
  recordCopy: { flex: 1 },
  recordName: { color: APP_COLORS.text, fontWeight: '700' },
  recordMeta: { color: APP_COLORS.textMuted, fontSize: 12, marginTop: APP_SPACING.xxs },
  oneRepMax: { alignItems: 'flex-end' },
  oneRepMaxValue: { color: APP_COLORS.primary, fontWeight: '800' },
  oneRepMaxLabel: { color: APP_COLORS.textSubtle, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginTop: 1 },
  activityRow: { alignItems: 'center', borderTopColor: APP_COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: APP_SPACING.sm, paddingVertical: APP_SPACING.sm },
  firstActivityRow: { borderTopWidth: 0, paddingTop: 0 },
  activityDate: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceSoft, borderRadius: APP_RADIUS.sm, minWidth: 56, paddingHorizontal: APP_SPACING.xs, paddingVertical: APP_SPACING.xs },
  activityDateText: { color: APP_COLORS.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  activityTitle: { color: APP_COLORS.text, fontWeight: '700' },
  sessionNote: { color: APP_COLORS.info, fontSize: 11, fontStyle: 'italic', marginTop: APP_SPACING.xxs },
});
