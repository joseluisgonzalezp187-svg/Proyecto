import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { signInWithEmail } from '@/lib/api/routines';
import { loginSchema } from '@/lib/validators/auth';
import { APP_COLORS } from '@/lib/constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setError('');
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.errors[0]?.message ?? 'Datos inválidos');
    setLoading(true);
    try { await signInWithEmail(email.trim(), password); router.replace('/(tabs)'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al iniciar sesión'); }
    finally { setLoading(false); }
  };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.brandMark}><MaterialCommunityIcons name="dumbbell" size={31} color={APP_COLORS.background} /></View>
      <Text variant="displaySmall" style={styles.logo}>GymRoutines</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Entrena con foco. Progresa con intención.</Text>
      <View style={styles.formCard}>
        <Text variant="titleLarge" style={styles.formTitle}>Bienvenido de nuevo</Text>
        <Text variant="bodyMedium" style={styles.formSubtitle}>Accede para continuar con tu entrenamiento.</Text>
        <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} textColor={APP_COLORS.text} left={<TextInput.Icon icon="email-outline" color={APP_COLORS.textMuted} />} />
        <TextInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} textColor={APP_COLORS.text} left={<TextInput.Icon icon="lock-outline" color={APP_COLORS.textMuted} />} />
        {error ? <HelperText type="error">{error}</HelperText> : null}
        <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} buttonColor={APP_COLORS.primary} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} style={styles.button}>Iniciar sesión</Button>
        <Link href="/(auth)/forgot-password" asChild><Button mode="text" textColor={APP_COLORS.textMuted}>¿Olvidaste tu contraseña?</Button></Link>
      </View>
      <View style={styles.footer}><Text style={styles.footerText}>¿Aún no tienes cuenta?</Text><Link href="/(auth)/register" asChild><Button mode="text" textColor={APP_COLORS.primary}>Crear cuenta</Button></Link></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 42 },
  brandMark: { width: 66, height: 66, borderRadius: 22, backgroundColor: APP_COLORS.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18 },
  logo: { color: APP_COLORS.text, fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  subtitle: { color: APP_COLORS.textMuted, textAlign: 'center', marginTop: 9, marginBottom: 34 },
  formCard: { backgroundColor: APP_COLORS.surface, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: APP_COLORS.border },
  formTitle: { color: APP_COLORS.text, fontWeight: '700' }, formSubtitle: { color: APP_COLORS.textMuted, marginTop: 5, marginBottom: 22 },
  input: { marginBottom: 12, backgroundColor: APP_COLORS.surfaceElevated },
  button: { marginTop: 8, marginBottom: 8 }, buttonContent: { height: 48 }, buttonLabel: { color: APP_COLORS.background, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 }, footerText: { color: APP_COLORS.textMuted },
});
