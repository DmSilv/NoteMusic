// FontLoader.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Font from 'expo-font';

const fetchFonts = () => {
  return Font.loadAsync({
    'Roboto-Bold': require('../../../../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('../../../../assets/fonts/Roboto-Light.ttf'),
    'Roboto-Medium': require('../../../../assets/fonts/Roboto-Medium.ttf'),
    'Poppins-SemiBold': require('../../../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Regular': require('../../../../assets/fonts/Poppins-Regular.ttf'),

  });
};

const FontLoader = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await fetchFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setLoadError(error);
      }
    };
    loadFonts();
  }, []);

  if (!fontsLoaded && !loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Erro ao carregar fontes. Verifique o console para mais detalhes.</Text>
      </View>
    );
  }

  return children; // Retorne os filhos se as fontes estiverem carregadas
};

export default FontLoader;
