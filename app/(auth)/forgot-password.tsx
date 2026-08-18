import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { resetPassword } from '@/lib/api/routines';
import { APP_COLORS } from '@/lib/constants';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');
    setMessage('');
    if (!email.includes('@')) {
      setError('Introduce un email válido');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage('Revisa tu email para restablecer la contraseña');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Recuperar contraseña
        </Text>
        <Text style={styles.subtitle}>
          Te enviaremos un enlace a tu email
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

        {error ? <HelperText type="error">{error}</HelperText> : null}
        {message ? <HelperText type="info">{message}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleReset}
          loading={loading}
          buttonColor={APP_COLORS.primary}
        >
          Enviar enlace
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text" textColor={APP_COLORS.textMuted}>
            Volver al login
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
    textAlign: 'center',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: APP_COLORS.surface,
  },
});
