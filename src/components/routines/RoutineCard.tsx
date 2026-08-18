import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Text } from 'react-native-paper';
import { Routine } from '@/types/database';
import { APP_COLORS, APP_RADIUS, APP_SPACING, GOAL_LABELS } from '@/lib/constants';

interface Props {
  routine: Routine;
  onPress: () => void;
  onTrain?: () => void;
}

export function RoutineCard({ routine, onPress, onTrain }: Props) {
  return (
    <Card style={styles.card} mode="elevated" onPress={onPress} accessibilityLabel={`Rutina ${routine.name}`}>
      <Card.Content style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text variant="titleLarge" style={styles.title}>{routine.name}</Text>
            {routine.description ? <Text variant="bodySmall" style={styles.description} numberOfLines={2}>{routine.description}</Text> : null}
          </View>
          {routine.goal ? (
            <View style={styles.goal}>
              <Text variant="labelSmall" style={styles.goalText}>{GOAL_LABELS[routine.goal]}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar-week" size={16} color={APP_COLORS.primary} />
            <Text style={styles.metaText}>{routine.days_per_week} días / semana</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={APP_COLORS.textMuted} />
            <Text style={styles.metaText}>Lista para entrenar</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="text" textColor={APP_COLORS.textMuted} onPress={onPress}>Detalles</Button>
        {onTrain ? (
          <Button
            mode="contained"
            buttonColor={APP_COLORS.primary}
            textColor={APP_COLORS.background}
            onPress={onTrain}
            icon="play"
            contentStyle={styles.trainContent}
            labelStyle={styles.trainLabel}
          >
            Entrenar
          </Button>
        ) : null}
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: APP_RADIUS.lg,
    borderWidth: 1,
    marginBottom: APP_SPACING.md,
    overflow: 'hidden',
  },
  content: { padding: APP_SPACING.md },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', gap: APP_SPACING.sm, justifyContent: 'space-between' },
  titleWrap: { flex: 1 },
  title: { color: APP_COLORS.text, fontWeight: '800' },
  description: { color: APP_COLORS.textMuted, lineHeight: 19, marginTop: APP_SPACING.xs },
  goal: { backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, paddingHorizontal: APP_SPACING.sm, paddingVertical: APP_SPACING.xxs },
  goalText: { color: APP_COLORS.primary, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: APP_SPACING.md, marginTop: APP_SPACING.lg },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: APP_SPACING.xs },
  metaText: { color: APP_COLORS.textMuted, fontSize: 13 },
  actions: { borderTopColor: APP_COLORS.border, borderTopWidth: 1, paddingHorizontal: APP_SPACING.sm, paddingVertical: APP_SPACING.xs },
  trainContent: { minHeight: 40, paddingHorizontal: APP_SPACING.xs },
  trainLabel: { fontWeight: '800' },
});
