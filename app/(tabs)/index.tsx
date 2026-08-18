import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { NutritionAdCarousel } from '@/components/ads/NutritionAdCarousel';
import { useNutritionAds, useRoutines } from '@/hooks/useExercises';
import { APP_COLORS, APP_RADIUS, APP_SHADOWS, APP_SPACING, GOAL_LABELS } from '@/lib/constants';

export default function HomeScreen() {
  const { data: ads = [] } = useNutritionAds();
  const { data: routines = [], isLoading } = useRoutines();
  const featuredRoutine = routines[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        eyebrow="TU ENTRENAMIENTO"
        title="Hoy cuenta"
        subtitle="Un paso a la vez también es progreso."
      />

      <Card style={styles.planCard} mode="elevated">
        <ImageBackground source={require('../../assets/images/hero_training.jpg')} style={styles.planImage} imageStyle={styles.planImageAsset}>
          <View style={styles.planImageOverlay}>
            <Text variant="labelLarge" style={styles.planImageKicker}>ENTRENA CON INTENCIÓN</Text>
            <Text variant="titleMedium" style={styles.planImageTitle}>Tu siguiente sesión empieza aquí</Text>
          </View>
        </ImageBackground>
        <Card.Content style={styles.planContent}>
          <View style={styles.planTopRow}>
            <View style={styles.planLabel}>
              <MaterialCommunityIcons name="calendar-check-outline" size={16} color={APP_COLORS.primary} />
              <Text variant="labelLarge" style={styles.planLabelText}>PLAN DE HOY</Text>
            </View>
            {featuredRoutine?.goal ? (
              <View style={styles.goalPill}>
                <Text variant="labelSmall" style={styles.goalText}>{GOAL_LABELS[featuredRoutine.goal]}</Text>
              </View>
            ) : null}
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={APP_COLORS.primary} />
              <Text style={styles.loadingText}>Preparando tu entrenamiento…</Text>
            </View>
          ) : featuredRoutine ? (
            <>
              <Text variant="headlineSmall" style={styles.routineName}>{featuredRoutine.name}</Text>
              <Text variant="bodyMedium" style={styles.planDescription}>
                {featuredRoutine.description || 'Sigue tu programación y suma una sesión más a tu semana.'}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="calendar-week" size={17} color={APP_COLORS.textMuted} />
                  <Text style={styles.metaText}>{featuredRoutine.days_per_week} días por semana</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="dumbbell" size={17} color={APP_COLORS.textMuted} />
                  <Text style={styles.metaText}>Rutina activa</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.routineName}>Diseña tu punto de partida</Text>
              <Text variant="bodyMedium" style={styles.planDescription}>
                Crea una rutina con tus ejercicios y empieza a registrar cada avance.
              </Text>
            </>
          )}
        </Card.Content>
        {!isLoading ? (
          <Card.Actions style={styles.planActions}>
            <Button
              mode="contained"
              buttonColor={APP_COLORS.primary}
              textColor={APP_COLORS.background}
              onPress={() => router.push(featuredRoutine ? `/routines/${featuredRoutine.id}` : '/routines/new')}
              contentStyle={styles.primaryActionContent}
              labelStyle={styles.primaryActionLabel}
              icon={featuredRoutine ? 'play' : 'plus'}
              accessibilityLabel={featuredRoutine ? `Abrir rutina ${featuredRoutine.name}` : 'Crear mi primera rutina'}
            >
              {featuredRoutine ? 'Abrir rutina' : 'Crear rutina'}
            </Button>
            {featuredRoutine ? (
              <Button mode="text" textColor={APP_COLORS.textMuted} onPress={() => router.push('/(tabs)/routines')}>
                Ver todas
              </Button>
            ) : null}
          </Card.Actions>
        ) : null}
      </Card>

      <View style={styles.tip}>
        <View style={styles.tipIcon}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={22} color={APP_COLORS.warning} />
        </View>
        <View style={styles.tipCopy}>
          <Text variant="labelLarge" style={styles.tipTitle}>HAZLO SOSTENIBLE</Text>
          <Text variant="bodyMedium" style={styles.tipText}>
            Registra peso y repeticiones. Ver tu progreso hace más fácil volver mañana.
          </Text>
        </View>
      </View>

      <NutritionAdCarousel ads={ads} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: APP_SPACING.xxxl },
  planCard: {
    ...APP_SHADOWS.card,
    backgroundColor: APP_COLORS.surfaceElevated,
    borderColor: APP_COLORS.borderStrong,
    borderRadius: APP_RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  planImage: { height: 168, justifyContent: 'flex-end' },
  planImageAsset: { resizeMode: 'cover' },
  planImageOverlay: { backgroundColor: 'rgba(7, 10, 8, 0.62)', padding: APP_SPACING.md },
  planImageKicker: { color: APP_COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  planImageTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.xxs },
  planContent: { padding: APP_SPACING.lg },
  planTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  planLabel: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs },
  planLabelText: { color: APP_COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.9 },
  goalPill: { backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, paddingHorizontal: APP_SPACING.sm, paddingVertical: APP_SPACING.xxs },
  goalText: { color: APP_COLORS.primary, fontWeight: '700' },
  routineName: { color: APP_COLORS.text, fontWeight: '800', letterSpacing: -0.5, marginTop: APP_SPACING.md },
  planDescription: { color: APP_COLORS.textMuted, lineHeight: 21, marginTop: APP_SPACING.xs },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: APP_SPACING.md, marginTop: APP_SPACING.lg },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs },
  metaText: { color: APP_COLORS.textMuted, fontSize: 13 },
  planActions: { alignItems: 'center', borderTopColor: APP_COLORS.border, borderTopWidth: 1, paddingHorizontal: APP_SPACING.lg, paddingVertical: APP_SPACING.sm },
  primaryActionContent: { minHeight: 46, paddingHorizontal: APP_SPACING.xs },
  primaryActionLabel: { color: APP_COLORS.background, fontWeight: '800' },
  loadingWrap: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.sm, marginTop: APP_SPACING.xl },
  loadingText: { color: APP_COLORS.textMuted },
  tip: { alignItems: 'center', backgroundColor: '#312C1D', borderColor: '#564A26', borderRadius: APP_RADIUS.lg, borderWidth: 1, flexDirection: 'row', gap: APP_SPACING.sm, marginTop: APP_SPACING.lg, padding: APP_SPACING.md },
  tipIcon: { alignItems: 'center', backgroundColor: '#453C1F', borderRadius: APP_RADIUS.pill, height: 42, justifyContent: 'center', width: 42 },
  tipCopy: { flex: 1 },
  tipTitle: { color: APP_COLORS.warning, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  tipText: { color: APP_COLORS.textMuted, lineHeight: 20, marginTop: APP_SPACING.xxs },
});
