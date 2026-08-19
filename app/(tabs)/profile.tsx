import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button, Card, Divider, HelperText, List, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useMyProfile, useUpdateMyProfile } from '@/hooks/useCommunity';
import { APP_COLORS } from '@/lib/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useMyProfile(user?.id);
  const updateProfile = useUpdateMyProfile(user?.id ?? '');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.display_name ?? profile.username);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaved(false);
    await updateProfile.mutateAsync({ username, displayName });
    setSaved(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Perfil" subtitle="Tu identidad y preferencias en GymRoutines" />

      <Card style={styles.profileCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Tu perfil público</Text>
          <Text style={styles.cardDescription}>Así aparecerás cuando compartas una sesión o escribas un comentario.</Text>
          <TextInput label="Nombre de usuario" value={username} onChangeText={(value) => setUsername(value.toLowerCase().replace(/\s/g, ''))} mode="outlined" autoCapitalize="none" maxLength={24} left={<TextInput.Affix text="@" />} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} style={styles.input} />
          <HelperText type="info" visible>Usa entre 3 y 24 caracteres: letras, números o guion bajo.</HelperText>
          <TextInput label="Nombre visible" value={displayName} onChangeText={setDisplayName} mode="outlined" maxLength={40} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} style={styles.input} />
          {updateProfile.isError ? <HelperText type="error" visible>{(updateProfile.error as Error).message}</HelperText> : null}
          {saved ? <HelperText type="info" visible style={styles.saved}>Perfil actualizado.</HelperText> : null}
          <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} loading={updateProfile.isPending || isLoading} disabled={updateProfile.isPending || isLoading} onPress={handleSave} style={styles.saveButton}>Guardar perfil</Button>
        </Card.Content>
      </Card>

      <List.Section style={styles.section}>
        <List.Item title={user?.email ?? 'Usuario'} description="Email de la cuenta" left={(props) => <List.Icon {...props} icon="email" color={APP_COLORS.primary} />} titleStyle={styles.listTitle} descriptionStyle={styles.listDesc} />
        <Divider />
        <List.Item title="Unidad de peso" description="Kilogramos (kg)" left={(props) => <List.Icon {...props} icon="weight-kilogram" color={APP_COLORS.primary} />} titleStyle={styles.listTitle} descriptionStyle={styles.listDesc} />
      </List.Section>

      <Button mode="outlined" textColor={APP_COLORS.error} style={styles.logout} onPress={handleSignOut}>Cerrar sesión</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  cardTitle: { color: APP_COLORS.text, fontWeight: '800' },
  cardDescription: { color: APP_COLORS.textMuted, lineHeight: 20, marginTop: 4 },
  input: { backgroundColor: APP_COLORS.surface, marginTop: 16 },
  saved: { color: APP_COLORS.success },
  saveButton: { marginTop: 8 },
  section: { backgroundColor: APP_COLORS.surface, borderRadius: 12, overflow: 'hidden' },
  listTitle: { color: APP_COLORS.text },
  listDesc: { color: APP_COLORS.textMuted },
  logout: { borderColor: APP_COLORS.error, marginTop: 32 },
});
