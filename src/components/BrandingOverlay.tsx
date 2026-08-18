import { Image, StyleSheet, View } from 'react-native';

const logo = require('../../assets/gymroutines-logo.png');

export function BrandingOverlay() {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Image source={logo} resizeMode="contain" style={styles.watermark} />
      <Image source={logo} resizeMode="contain" style={styles.cornerLogo} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  watermark: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignSelf: 'center',
    top: '38%',
    opacity: 0.055,
  },
  cornerLogo: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 54,
    height: 54,
    opacity: 0.96,
  },
});
