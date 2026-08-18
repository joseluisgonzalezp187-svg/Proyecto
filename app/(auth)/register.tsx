import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { signUpWithEmail } from '@/lib/api/routines';
import { registerSchema } from '@/lib/validators/auth';
import { APP_COLORS } from '@/lib/constants';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    const parsed = registerSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          Crear cuenta
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          textColor={APP_COLORS.text}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          textColor={APP_COLORS.text}
        />
        <TextInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          textColor={APP_COLORS.text}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          buttonColor={APP_COLORS.primary}
          style={styles.button}
        >
          Registrarse
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text" textColor={APP_COLORS.textMuted}>
            Ya tengo cuenta
          </Button>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: APP_COLORS.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: APP_COLORS.text,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: APP_COLORS.surface,
  },
  button: {
    marginTop: 8,
  },
});
