import { useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Pressable } from 'react-native';

interface Props {
  routineName: string;
  dayName: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  exerciseCount: number;
}

export function WorkoutShareButton(props: Props) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        await Share.share({ message: `${props.routineName} · ${props.dayName}\n${props.completedSets}/${props.totalSets} series completadas` });
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir entrenamiento' });
      } else {
        await Share.share({ message: `${props.routineName} · ${props.dayName}` });
      }
    } catch (error) {
      if ((error as { message?: string })?.message !== 'User did not share') {
        Alert.alert('No se pudo compartir', 'Inténtalo de nuevo cuando termine el entrenamiento.');
      }
    } finally {
      setSharing(false);
    }
  };

  const minutes = Math.floor(props.durationSeconds / 60);
  const seconds = String(props.durationSeconds % 60).padStart(2, '0');

  return (
    <>
      <Pressable onPress={handleShare} disabled={sharing} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="instagram" size={20} color="#0B0D0C" />
        <Text style={styles.shareText}>{sharing ? 'Preparando…' : 'Compartir en historias'}</Text>
      </Pressable>
      <View ref={cardRef} collapsable={false} style={styles.storyCard}>
        <View style={styles.logoMark}><Text style={styles.logoG}>G</Text><Text style={styles.logoR}>R</Text></View>
        <Text style={styles.brand}>GYMROUTINES</Text>
        <View style={styles.iconCircle}><MaterialCommunityIcons name="dumbbell" size={44} color="#B8F500" /></View>
        <Text style={styles.title}>{props.routineName}</Text>
        <Text style={styles.subtitle}>{props.dayName}</Text>
        <View style={styles.stats}>
          <View><Text style={styles.statValue}>{minutes}:{seconds}</Text><Text style={styles.statLabel}>DURACIÓN</Text></View>
          <View><Text style={styles.statValue}>{props.completedSets}/{props.totalSets}</Text><Text style={styles.statLabel}>SERIES</Text></View>
          <View><Text style={styles.statValue}>{props.exerciseCount}</Text><Text style={styles.statLabel}>EJERCICIOS</Text></View>
        </View>
        <Text style={styles.footer}>ENTRENA. PROGRESA. REPITE.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, minHeight: 50, borderRadius: 12, backgroundColor: '#B8F500', paddingHorizontal: 16 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  shareText: { color: '#0B0D0C', fontSize: 15, fontWeight: '800' },
  storyCard: { position: 'absolute', left: -2000, top: 0, width: 1080, height: 1920, padding: 90, backgroundColor: '#0B0D0C', alignItems: 'center' },
  logoMark: { flexDirection: 'row', marginTop: 100 },
  logoG: { color: '#F5F7F4', fontSize: 96, fontWeight: '900' },
  logoR: { color: '#B8F500', fontSize: 96, fontWeight: '900' },
  brand: { color: '#B8F500', letterSpacing: 6, fontSize: 24, fontWeight: '800', marginTop: 12 },
  iconCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#151918', alignItems: 'center', justifyContent: 'center', marginTop: 210, marginBottom: 100 },
  title: { color: '#F5F7F4', fontSize: 64, lineHeight: 74, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#B8F500', fontSize: 34, fontWeight: '700', marginTop: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 180, padding: 42, borderRadius: 28, backgroundColor: '#151918' },
  statValue: { color: '#F5F7F4', fontSize: 42, fontWeight: '900', textAlign: 'center' },
  statLabel: { color: '#8C9690', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  footer: { position: 'absolute', bottom: 100, color: '#8C9690', fontSize: 18, letterSpacing: 4, fontWeight: '700' },
});
