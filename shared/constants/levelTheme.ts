/**
 * Tema de chrome (barras, menus, headers) por nível do usuário.
 * Fonte única para StatusBar, SafeArea superior e MenuBottom.
 *
 * Para adicionar um nível: atualize LevelColors em theme.ts — getLevelTheme herda automaticamente.
 */
import { getLevelColors } from './theme';

export type LevelChromeTheme = {
  /** Cor primária do nível */
  primary: string;
  secondary: string;
  /** StatusBar / SafeArea superior */
  statusBarBackground: string;
  safeAreaTopBackground: string;
  statusBarStyle: 'light-content' | 'dark-content';
  /** Textos e ícones sobre fundo colorido (barras, menus, headers de navegação) */
  textColor: string;
  iconColor: string;
  activeTextColor: string;
  inactiveTextColor: string;
  /** Menu inferior — fundo segue a cor primária do nível */
  tabBarBackground: string;
  tabBarBorder: string;
  /** Área branca do header abaixo da barra colorida */
  headerContentBackground: string;
  /** Fundo do conteúdo principal */
  screenContentBackground: string;
};

const CHROME_TEXT = '#FFFFFF';
const CHROME_ICON = '#FFFFFF';
const CHROME_ACTIVE_TEXT = '#FFFFFF';
const CHROME_INACTIVE_TEXT = 'rgba(255, 255, 255, 0.6)';
const TAB_BAR_BORDER = 'rgba(255, 255, 255, 0.25)';
const HEADER_CONTENT_BG = '#FFFFFF';
const SCREEN_CONTENT_BG = '#FFFFFF';

/**
 * Retorna o tema de chrome para o nível informado.
 * Fallback seguro: aprendiz quando level é undefined, null ou inválido.
 */
export function getLevelTheme(level?: string | null): LevelChromeTheme {
  const colors = getLevelColors(level ?? 'aprendiz');

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    statusBarBackground: colors.primary,
    safeAreaTopBackground: colors.primary,
    statusBarStyle: 'light-content',
    textColor: CHROME_TEXT,
    iconColor: CHROME_ICON,
    activeTextColor: CHROME_ACTIVE_TEXT,
    inactiveTextColor: CHROME_INACTIVE_TEXT,
    tabBarBackground: colors.primary,
    tabBarBorder: TAB_BAR_BORDER,
    headerContentBackground: HEADER_CONTENT_BG,
    screenContentBackground: SCREEN_CONTENT_BG,
  };
}

/** Tema padrão (aprendiz) — telas sem usuário autenticado */
export const DEFAULT_LEVEL_CHROME = getLevelTheme('aprendiz');
