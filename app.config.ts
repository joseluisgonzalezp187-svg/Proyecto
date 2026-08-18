import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GymRoutines',
  slug: 'gym-routines',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'gymroutines',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0f172a',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gymroutines.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0f172a',
    },
    package: 'com.gymroutines.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-asset', 'expo-font'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
