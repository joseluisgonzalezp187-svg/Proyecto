import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Exercise } from '@/types/database';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS, APP_COLORS } from '@/lib/constants';
import { ExerciseImage } from './ExerciseImage';

interface Props { exercise: Exercise; onPress?: () => void; selected?: boolean; }

export function ExerciseCard({ exercise, onPress, selected }: Props) {
  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      <ExerciseImage exercise={exercise} />
      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.name}>{exercise.name}</Text>
        <View style={styles.meta}>
          <Text variant="labelSmall" style={styles.metaText}>{MUSCLE_GROUP_LABELS[exercise.muscle_group]}</Text>
          <Text variant="labelSmall" style={styles.metaText}> · {EQUIPMENT_LABELS[exercise.equipment]}</Text>
        </View>
        <Chip mode={selected ? 'flat' : 'outlined'} selected={selected} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]} textStyle={styles.chipText}>
          {selected ? 'Seleccionado' : 'Añadir a la rutina'}
        </Chip>
      </View>
    </View>
  );
}

export function ExerciseListItem({ exercise }: { exercise: Exercise }) {
  return (
    <View style={styles.listItem}>
      <ExerciseImage exercise={exercise} />
      <Text variant="titleSmall" style={styles.name}>{exercise.name}</Text>
      <View style={styles.meta}>
        <Text variant="labelSmall" style={styles.metaText}>{MUSCLE_GROUP_LABELS[exercise.muscle_group]}</Text>
        <Text variant="labelSmall" style={styles.metaText}> · {EQUIPMENT_LABELS[exercise.equipment]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 220, marginRight: 10, marginBottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: APP_COLORS.surfaceElevated, borderWidth: 1, borderColor: APP_COLORS.border },
  cardSelected: { borderColor: APP_COLORS.primary, borderWidth: 2 },
  content: { padding: 10 },
  name: { color: APP_COLORS.text, fontWeight: '700' },
  meta: { flexDirection: 'row', marginTop: 4, marginBottom: 8 },
  metaText: { color: APP_COLORS.textMuted },
  chip: { alignSelf: 'flex-start', backgroundColor: 'transparent', borderColor: APP_COLORS.border },
  chipSelected: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  chipText: { color: APP_COLORS.text, fontWeight: '600' },
  listItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: APP_COLORS.surface },
});
