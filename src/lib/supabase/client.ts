import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  '';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env'
  );
}

const isWebServerRender = Platform.OS === 'web' && typeof window === 'undefined';
const authStorage = Platform.OS === 'web' && !isWebServerRender
  ? window.localStorage
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: !isWebServerRender,
    persistSession: !isWebServerRender,
    detectSessionInUrl: false,
  },
});
