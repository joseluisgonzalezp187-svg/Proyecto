import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { APP_COLORS, APP_SPACING } from '@/lib/constants';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function ScreenHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text variant="labelLarge" style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text variant="headlineSmall" style={styles.title}>{title}</Text>
      {subtitle ? <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: APP_SPACING.xl,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: APP_SPACING.xs,
  },
  title: {
    color: APP_COLORS.text,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    lineHeight: 21,
    marginTop: APP_SPACING.xs,
  },
});
