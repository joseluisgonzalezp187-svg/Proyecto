import { Image, StyleSheet, View } from 'react-native';
import { Exercise } from '@/types/database';

const FALLBACK_IMAGES: Record<string, number> = {
  pecho: require('../../../assets/images/routine_strength.jpg'),
  espalda: require('../../../assets/images/training_focus.jpg'),
  hombros: require('../../../assets/images/hero_training.jpg'),
  biceps: require('../../../assets/images/training_focus.jpg'),
  triceps: require('../../../assets/images/training_focus.jpg'),
  piernas: require('../../../assets/images/routine_strength.jpg'),
  gluteos: require('../../../assets/images/routine_strength.jpg'),
  core: require('../../../assets/images/hero_training.jpg'),
  cardio: require('../../../assets/images/hero_training.jpg'),
  full_body: require('../../../assets/images/hero_training.jpg'),
};

export function ExerciseImage({ exercise }: { exercise: Exercise }) {
  const source = exercise.image_url ? { uri: exercise.image_url } : FALLBACK_IMAGES[exercise.muscle_group] ?? FALLBACK_IMAGES.full_body;
  return (
    <View style={styles.wrapper}>
      <Image source={source} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', height: 132, overflow: 'hidden', borderRadius: 14, backgroundColor: '#20252c' },
  image: { width: '100%', height: '100%' },
});
