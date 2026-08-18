import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Iniciando GymRoutines..." />;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
