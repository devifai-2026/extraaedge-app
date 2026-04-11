import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const PRIMARY_RED = '#E53935';
const SECONDARY_BLACK = '#000000';
const BACKGROUND_WHITE = '#FFFFFF';

interface AppSplashScreenProps {
  onFinish?: () => void;
}

export function AppSplashScreen({ onFinish }: AppSplashScreenProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoTranslateY = useSharedValue(0);
  
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });

    // Text entrance
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 600 }));

    // Exit animation after delay
    const totalDuration = 2500;
    const timeout = setTimeout(() => {
        screenOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
            if (finished && onFinish) {
                runOnJS(onFinish)();
            }
        });
    }, totalDuration);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value }
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Abstract Background Shapes */}
      <View style={[styles.bgShape, styles.shape1]} />
      <View style={[styles.bgShape, styles.shape2]} />
      <View style={[styles.bgShape, styles.shape3]} />

      <View style={styles.centerContent}>
        {/* Modern Logo (SVG-like implementation with Views) */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBase}>
            <View style={styles.logoInner}>
                <View style={styles.logoAccent} />
                <View style={styles.logoMark} />
            </View>
          </View>
        </Animated.View>

        {/* Brand Text */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.brandName}>ExtraaEdge</Text>
          <Text style={styles.tagline}>Empowering Education Growth</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKGROUND_WHITE,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgShape: {
    position: 'absolute',
    backgroundColor: PRIMARY_RED,
    opacity: 0.05,
    borderRadius: 100,
  },
  shape1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  shape2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: -width * 0.1,
    left: -width * 0.2,
  },
  shape3: {
    width: width * 0.3,
    height: width * 0.3,
    top: '40%',
    left: -width * 0.1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: SECONDARY_BLACK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  logoBase: {
    width: 100,
    height: 100,
    backgroundColor: PRIMARY_RED,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 60,
    height: 60,
    borderWidth: 8,
    borderColor: BACKGROUND_WHITE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAccent: {
    position: 'absolute',
    width: '60%',
    height: 8,
    backgroundColor: BACKGROUND_WHITE,
    top: '40%',
    borderRadius: 4,
  },
  logoMark: {
    width: 20,
    height: 20,
    backgroundColor: BACKGROUND_WHITE,
    position: 'absolute',
    right: -4,
    bottom: -4,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: PRIMARY_RED,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: SECONDARY_BLACK,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
