import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { APP_COLORS } from '@/lib/constants';
import { NutritionAd } from '@/types/database';

interface Props {
  ads: NutritionAd[];
}

export function NutritionAdCarousel({ ads }: Props) {
  if (!ads.length) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Nutrición recomendada
      </Text>
      {ads.map((ad) => (
        <Card key={ad.id} style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="labelSmall" style={styles.badge}>
              Publicidad
            </Text>
            <Text variant="titleMedium" style={styles.adTitle}>
              {ad.title}
            </Text>
            {ad.description ? (
              <Text variant="bodyMedium" style={styles.description}>
                {ad.description}
              </Text>
            ) : null}
          </Card.Content>
          {ad.link_url ? (
            <Card.Actions>
              <Button mode="text" textColor={APP_COLORS.primary} onPress={() => {}}>
                Ver producto
              </Button>
            </Card.Actions>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 16,
  },
  title: {
    color: APP_COLORS.text,
    fontWeight: '600',
  },
  card: {
    backgroundColor: APP_COLORS.surface,
  },
  badge: {
    color: APP_COLORS.warning,
    marginBottom: 4,
  },
  adTitle: {
    color: APP_COLORS.text,
  },
  description: {
    color: APP_COLORS.textMuted,
    marginTop: 4,
  },
});
