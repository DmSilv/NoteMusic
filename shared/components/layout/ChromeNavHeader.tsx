import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { DEFAULT_LEVEL_CHROME } from '@/shared/constants/levelTheme';

type ChromeNavHeaderProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'nav' = UserInfo à direita (padrão); 'title' = título ao lado do botão voltar */
  variant?: 'nav' | 'title';
};

/**
 * Linha de navegação (voltar + UserInfo) sobre fundo branco do app.
 * A cor do nível fica apenas na faixa do safe area (LevelScreenShell).
 */
const ChromeNavHeader: React.FC<ChromeNavHeaderProps> = ({
  children,
  style,
  variant = 'nav',
}) => {
  return (
    <View
      style={[
        {
          flexDirection: variant === 'title' ? 'row' : 'row-reverse',
          alignItems: 'center',
          alignSelf: 'stretch',
          position: 'relative',
          paddingVertical: 8,
          paddingHorizontal: 16,
          width: '100%',
          backgroundColor: DEFAULT_LEVEL_CHROME.screenContentBackground,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ChromeNavHeader;
