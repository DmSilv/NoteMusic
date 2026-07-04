import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/shared/components/notification/NotificationProvider';
import AppSplashScreen from '@/shared/components/splash/AppSplashScreen';
import RootNavigator from './navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

const fetchFonts = () => {
  return Font.loadAsync({
    'Roboto-Light': require('@/assets/fonts/Roboto-Light.ttf'),
    'Roboto-Regular': require('@/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('@/assets/fonts/Roboto-Bold.ttf'),
  });
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await fetchFonts();
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
      } finally {
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setSplashFinished(true);
  }, []);

  /** Esconde a splash nativa assim que a animada estiver na tela (senão ela fica por cima e bloqueia a animação). */
  const handleAnimatedSplashReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !splashFinished) {
      return;
    }

    setAppReady(true);
  }, [fontsLoaded, splashFinished]);

  if (!appReady) {
    return <AppSplashScreen onFinish={handleSplashFinish} onLayoutReady={handleAnimatedSplashReady} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
