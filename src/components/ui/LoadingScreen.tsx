import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { APP_COLORS } from '@/lib/constants';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={APP_COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    gap: 16,
  },
  text: {
    color: APP_COLORS.textMuted,
  },
});
