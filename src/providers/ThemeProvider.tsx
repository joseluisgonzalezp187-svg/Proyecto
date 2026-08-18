import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { ReactNode } from 'react';
import { APP_COLORS } from '@/lib/constants';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: APP_COLORS.primary,
    onPrimary: APP_COLORS.background,
    background: APP_COLORS.background,
    surface: APP_COLORS.surface,
    surfaceVariant: APP_COLORS.surfaceElevated,
    onSurface: APP_COLORS.text,
    outline: APP_COLORS.border,
    error: APP_COLORS.error,
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
