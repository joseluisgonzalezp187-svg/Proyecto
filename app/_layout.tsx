import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppProviders } from '@/providers/AppProviders';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { BrandingOverlay } from '@/components/BrandingOverlay';

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0D0C' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="routines/new" options={{ headerShown: true, title: 'Nueva rutina', headerStyle: { backgroundColor: '#151918' }, headerTintColor: '#F5F7F4', headerTitleStyle: { fontWeight: '700' } }} />
            <Stack.Screen name="routines/[id]" options={{ headerShown: true, title: 'Rutina', headerStyle: { backgroundColor: '#151918' }, headerTintColor: '#F5F7F4', headerTitleStyle: { fontWeight: '700' } }} />
            <Stack.Screen name="train/[dayId]" options={{ headerShown: true, title: 'Entrenar', headerStyle: { backgroundColor: '#151918' }, headerTintColor: '#F5F7F4', headerTitleStyle: { fontWeight: '700' } }} />
          </Stack>
          <BrandingOverlay />
        </AuthProvider>
      </ThemeProvider>
    </AppProviders>
  );
}
