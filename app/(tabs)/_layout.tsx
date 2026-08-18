import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_COLORS } from '@/lib/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: APP_COLORS.background },
        headerTintColor: APP_COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: APP_COLORS.surface, borderTopColor: APP_COLORS.border, height: 68, paddingTop: 7 },
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarInactiveTintColor: APP_COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
