import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text } from 'react-native-paper';
import { APP_COLORS, APP_RADIUS, APP_SPACING } from '@/lib/constants';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Props {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  footer,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={30} color={APP_COLORS.primary} />
      </View>
      <Text variant="titleLarge" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button
          mode="contained"
          buttonColor={APP_COLORS.primary}
          textColor={APP_COLORS.background}
          onPress={onAction}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {actionLabel}
        </Button>
      ) : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: APP_RADIUS.xl,
    borderWidth: 1,
    padding: APP_SPACING.xxl,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceAccent,
    borderRadius: APP_RADIUS.pill,
    height: 64,
    justifyContent: 'center',
    marginBottom: APP_SPACING.md,
    width: 64,
  },
  title: {
    color: APP_COLORS.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: APP_COLORS.textMuted,
    lineHeight: 21,
    marginTop: APP_SPACING.xs,
    maxWidth: 310,
    textAlign: 'center',
  },
  button: {
    marginTop: APP_SPACING.lg,
  },
  buttonContent: {
    minHeight: 46,
    paddingHorizontal: APP_SPACING.sm,
  },
  footer: {
    marginTop: APP_SPACING.md,
  },
});
