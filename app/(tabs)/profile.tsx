import { ScrollView, StyleSheet } from 'react-native';
import { Text, Button, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { APP_COLORS } from '@/lib/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Perfil" subtitle="Tu cuenta y preferencias" />

      <List.Section style={styles.section}>
        <List.Item
          title={user?.email ?? 'Usuario'}
          description="Email de la cuenta"
          left={(props) => <List.Icon {...props} icon="email" color={APP_COLORS.primary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
        <Divider />
        <List.Item
          title="Unidad de peso"
          description="Kilogramos (kg)"
          left={(props) => <List.Icon {...props} icon="weight-kilogram" color={APP_COLORS.primary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
        <Divider />
        <List.Item
          title="Versión"
          description="0.1.0 — MVP"
          left={(props) => <List.Icon {...props} icon="information" color={APP_COLORS.primary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
      </List.Section>

      <Button
        mode="outlined"
        textColor={APP_COLORS.error}
        style={styles.logout}
        onPress={handleSignOut}
      >
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listTitle: {
    color: APP_COLORS.text,
  },
  listDesc: {
    color: APP_COLORS.textMuted,
  },
  logout: {
    marginTop: 32,
    borderColor: APP_COLORS.error,
  },
});
