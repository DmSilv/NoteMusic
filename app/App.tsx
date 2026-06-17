import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/shared/components/notification/NotificationProvider';
import RootNavigator from './navigation/RootNavigator';

const fetchFonts = () => {
  return Font.loadAsync({
    'Roboto-Light': require('@/assets/fonts/Roboto-Light.ttf'),
    'Roboto-Regular': require('@/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('@/assets/fonts/Roboto-Bold.ttf'),
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await fetchFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
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
