import React, { useCallback } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { getLevelTheme } from '@/shared/constants/levelTheme';

type MenuBottomProps = {
  current: 'home' | 'profile';
  goHome: () => void;
  goProfile: () => void;
  /** Nível do usuário logado; omitir = fallback aprendiz */
  level?: string | null;
};

async function applyAndroidNavigationBar(): Promise<void> {
  try {
    // Edge-to-edge: setStyle define barra clara sem pintar com cor do nível
    NavigationBar.setStyle('light');
    await NavigationBar.setButtonStyleAsync('dark');
  } catch {
    // ignore
  }
}

/** Altura da faixa de ícones (sem safe area inferior). */
export const MENU_CONTENT_HEIGHT = 48;

/** Espaço para ScrollView não ficar atrás do menu. */
export function getMenuBottomHeight(bottomInset: number): number {
  return MENU_CONTENT_HEIGHT + Math.max(bottomInset, 0);
}

const MenuBottom: React.FC<MenuBottomProps> = ({ current, goHome, goProfile, level }) => {
  const chrome = getLevelTheme(level);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }

      applyAndroidNavigationBar();
      return undefined;
    }, [])
  );

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={[styles.menuRow, { backgroundColor: chrome.tabBarBackground }]}>
        <TouchableOpacity style={styles.menuItem} onPress={goHome}>
          <MaterialCommunityIcons
            name="home-variant"
            size={28}
            color={current === 'home' ? chrome.activeTextColor : chrome.inactiveTextColor}
          />
          <Text
            style={[
              styles.menuLabel,
              { color: chrome.inactiveTextColor },
              current === 'home' && { color: chrome.activeTextColor, fontWeight: 'bold' },
            ]}
          >
            Início
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
          <MaterialCommunityIcons
            name="account-circle"
            size={28}
            color={current === 'profile' ? chrome.activeTextColor : chrome.inactiveTextColor}
          />
          <Text
            style={[
              styles.menuLabel,
              { color: chrome.inactiveTextColor },
              current === 'profile' && { color: chrome.activeTextColor, fontWeight: 'bold' },
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default MenuBottom;
