import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

interface UseStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
}

export const useStatusBar = ({
  backgroundColor = '#007AFF',
  barStyle = 'light-content',
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
