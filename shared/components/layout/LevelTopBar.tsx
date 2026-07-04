import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLevelTheme } from '@/shared/constants/levelTheme';

type LevelTopBarProps = {
  level?: string | null;
};

/**
 * Apenas a faixa superior (StatusBar + SafeArea top).
 * Usado em ProfileHome, onde o layout divide top bar e conteúdo.
 */
const LevelTopBar: React.FC<LevelTopBarProps> = ({ level }) => {
  const chrome = getLevelTheme(level);

  return (
    <>
      <StatusBar
        barStyle={chrome.statusBarStyle}
        backgroundColor={chrome.statusBarBackground}
      />
      <SafeAreaView edges={['top']} style={{ backgroundColor: chrome.safeAreaTopBackground }} />
    </>
  );
};

export default LevelTopBar;
