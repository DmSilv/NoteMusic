import React from 'react';
import { StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLevelTheme } from '@/shared/constants/levelTheme';

type LevelScreenShellProps = {
  /** Nível do usuário; omitir = fallback aprendiz (auth/onboarding) */
  level?: string | null;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Padrão alinhado ao ProfileHome:
 * - faixa fina colorida só no safe area superior (StatusBar/notch)
 * - restante da tela com fundo branco
 */
const LevelScreenShell: React.FC<LevelScreenShellProps> = ({ level, children, style }) => {
  const chrome = getLevelTheme(level);

  return (
    <View style={[{ flex: 1, backgroundColor: chrome.screenContentBackground }, style]}>
      <StatusBar
        barStyle={chrome.statusBarStyle}
        backgroundColor={chrome.statusBarBackground}
        translucent={false}
        animated
      />
      <SafeAreaView edges={['top']} style={{ backgroundColor: chrome.safeAreaTopBackground }} />
      <View style={{ flex: 1, width: '100%', backgroundColor: chrome.screenContentBackground }}>
        {children}
      </View>
    </View>
  );
};

export default LevelScreenShell;
