import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

import { DEFAULT_LEVEL_CHROME } from '@/shared/constants/levelTheme';

interface UseStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
}

export const useStatusBar = ({
  backgroundColor = DEFAULT_LEVEL_CHROME.statusBarBackground,
  barStyle = DEFAULT_LEVEL_CHROME.statusBarStyle,
  translucent = false
}: UseStatusBarProps = {}) => {
  useEffect(() => {
    // Configurar estilo da barra
    StatusBar.setBarStyle(barStyle, true);
    
    // Configurar cor de fundo apenas no Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor, true);
      StatusBar.setTranslucent(translucent);
    }
  }, [backgroundColor, barStyle, translucent]);
};

export default useStatusBar;
