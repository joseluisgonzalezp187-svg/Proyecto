import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { useRoutines } from '@/hooks/useExercises';
import { APP_COLORS, APP_SPACING } from '@/lib/constants';

export default function RoutinesScreen() {
  const { data: routines = [], isLoading, error } = useRoutines();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="TU BIBLIOTECA"
          title="Mis rutinas"
          subtitle="Elige un plan y conviértelo en una sesión."
        />
        <ImageBackground source={require('../../assets/images/routine_strength.jpg')} style={styles.heroBanner} imageStyle={styles.heroBannerAsset}>
          <View style={styles.heroBannerOverlay}>
            <Text variant="labelLarge" style={styles.heroBannerEyebrow}>TU PLAN, TU RITMO</Text>
            <Text variant="titleMedium" style={styles.heroBannerTitle}>Cada repetición suma.</Text>
          </View>
        </ImageBackground>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={APP_COLORS.primary} />
            <Text style={styles.loaderText}>Cargando tus rutinas…</Text>
          </View>
        ) : null}

        {error ? (
          <EmptyState
            icon="cloud-off-outline"
            title="No pudimos cargar tus rutinas"
            description="Revisa tu conexión e inténtalo de nuevo desde esta pantalla."
          />
        ) : null}

        {!isLoading && !error && routines.length === 0 ? (
          <EmptyState
            icon="dumbbell"
            title="Diseña tu primera rutina"
            description="Elige ejercicios, define series y deja listo un plan para tu próxima sesión."
            actionLabel="Crear rutina"
            onAction={() => router.push('/routines/new')}
          />
        ) : null}

        {!isLoading && !error && routines.length > 0 ? (
          <>
            <View style={styles.summary}>
              <MaterialCommunityIcons name="check-decagram-outline" size={18} color={APP_COLORS.primary} />
              <Text style={styles.summaryText}>{routines.length} {routines.length === 1 ? 'rutina disponible' : 'rutinas disponibles'}</Text>
            </View>
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onPress={() => router.push(`/routines/${routine.id}`)}
                onTrain={() => router.push(`/routines/${routine.id}`)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
      <FAB
        icon="plus"
        label="Nueva rutina"
        style={styles.fab}
        color={APP_COLORS.background}
        onPress={() => router.push('/routines/new')}
        accessibilityLabel="Crear una nueva rutina"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: 110 },
  heroBanner: { height: 138, justifyContent: 'flex-end', marginBottom: APP_SPACING.lg, overflow: 'hidden' },
  heroBannerAsset: { borderRadius: 18, resizeMode: 'cover' },
  heroBannerOverlay: { backgroundColor: 'rgba(7, 10, 8, 0.64)', padding: APP_SPACING.md },
  heroBannerEyebrow: { color: APP_COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroBannerTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.xxs },
  loader: { alignItems: 'center', gap: APP_SPACING.sm, justifyContent: 'center', marginTop: APP_SPACING.xl },
  loaderText: { color: APP_COLORS.textMuted },
  summary: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs, marginBottom: APP_SPACING.md },
  summaryText: { color: APP_COLORS.textMuted, fontSize: 13 },
  fab: { backgroundColor: APP_COLORS.primary, borderRadius: 16, bottom: APP_SPACING.lg, position: 'absolute', right: APP_SPACING.lg },
});
