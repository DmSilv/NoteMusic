import { Platform } from 'react-native';

export const statusBarConfig = {
  // Configurações para iOS
  ios: {
    barStyle: 'dark-content' as const,
    backgroundColor: 'transparent',
    translucent: true,
  },
  // Configurações para Android
  android: {
    barStyle: 'dark-content' as const,
    backgroundColor: 'transparent',
    translucent: true,
  },
  // Configurações gerais
  general: {
    animated: true,
    hidden: false,
  }
};

export const getStatusBarConfig = () => {
  return Platform.OS === 'ios' ? statusBarConfig.ios : statusBarConfig.android;
};
