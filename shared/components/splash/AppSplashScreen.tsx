import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
import LogoName from '@/assets/images/LogoName.png';
import { getLogoNameHeight, logoNameImageStyles } from '@/shared/constants/logoNameLayout';

const SPLASH_BG = '#FFFFFF';
const BRAND_BLUE = '#0087D3';
const MIN_DISPLAY_MS = 2400;
const SPLASH_TAGLINE = 'Uma experiência única de aprendizado e música.';

type AppSplashScreenProps = {
  onFinish: () => void;
  onLayoutReady?: () => void;
};

const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish, onLayoutReady }) => {
  const layoutReadySent = useRef(false);
  const { height: windowHeight } = useWindowDimensions();
  const logoHeight = getLogoNameHeight(windowHeight);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(16)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const logoPopAnimation = Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.08,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]);

    const taglineAnimation = Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 550,
        delay: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslate, {
        toValue: 0,
        duration: 550,
        delay: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -5,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const progressAnimation = Animated.timing(progressWidth, {
      toValue: 1,
      duration: MIN_DISPLAY_MS - 400,
      delay: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    });

    logoPopAnimation.start(({ finished }) => {
      if (finished) {
        floatAnimation.start();
      }
    });
    taglineAnimation.start();
    progressAnimation.start();

    const finishTimer = setTimeout(() => {
      floatAnimation.stop();
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => onFinish());
    }, MIN_DISPLAY_MS);

    return () => {
      clearTimeout(finishTimer);
      floatAnimation.stop();
      progressAnimation.stop();
    };
  }, [
    logoFloat,
    logoScale,
    onFinish,
    progressWidth,
    screenOpacity,
    taglineOpacity,
    taglineTranslate,
  ]);

  const progressInterpolated = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity: screenOpacity }]}
      onLayout={() => {
        if (layoutReadySent.current) return;
        layoutReadySent.current = true;
        onLayoutReady?.();
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={SPLASH_BG} />
      <Animated.View
        style={[
          styles.logoStage,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: logoFloat }],
          },
        ]}
      >
        <Image
          source={LogoName}
          style={[logoNameImageStyles.image, { height: logoHeight }]}
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslate }],
          },
        ]}
      >
        {SPLASH_TAGLINE}
      </Animated.Text>

      <Animated.View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressInterpolated }]} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    marginTop: 28,
    fontSize: 14,
    color: '#5A6B7A',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    paddingHorizontal: 28,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 52,
    width: 140,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 135, 211, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: BRAND_BLUE,
  },
});

export default AppSplashScreen;
