/**
 * Design tokens e helpers de responsividade compartilhados entre telas.
 * Evita valores mágicos espalhados e centraliza breakpoints de teste.
 */

export const BREAKPOINTS = {
  width: {
    small: 360,
    medium: 390,
    large: 430,
  },
  height: {
    compact: 640,
    medium: 720,
    tall: 844,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 45,
  pill: 100,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 22,
  hero: 24,
} as const;

/** Área mínima recomendada para toque (Material / Apple HIG). */
export const MIN_TOUCH_TARGET = 44;

/** Presets usados nos testes automatizados de responsividade. */
export const SCREEN_PRESETS = {
  small: { width: 360, height: 640 },
  medium: { width: 390, height: 844 },
  large: { width: 430, height: 932 },
} as const;

export type ScreenSizeCategory = 'compact' | 'medium' | 'large';

export function getScreenSizeCategory(width: number, height: number): ScreenSizeCategory {
  if (width <= BREAKPOINTS.width.small || height <= BREAKPOINTS.height.compact) {
    return 'compact';
  }
  if (width >= BREAKPOINTS.width.large && height >= BREAKPOINTS.height.tall) {
    return 'large';
  }
  return 'medium';
}

export function getHorizontalPadding(category: ScreenSizeCategory): number {
  if (category === 'compact') return SPACING.md;
  return SPACING.lg;
}

export function getContentWidth(windowWidth: number, horizontalPadding?: number): number {
  const padding = horizontalPadding ?? SPACING.lg;
  return Math.max(windowWidth - padding * 2, 0);
}

/** Largura padrão de inputs/botões primários em formulários. */
export function getFormFieldWidth(windowWidth: number): number {
  const ratio = windowWidth <= BREAKPOINTS.width.small ? 0.9 : 0.85;
  return Math.min(windowWidth * ratio, 400);
}

/** Empilha botões lado a lado quando a tela é estreita. */
export function shouldStackButtons(windowWidth: number): boolean {
  return windowWidth < BREAKPOINTS.width.medium;
}

export function getIllustrationHeight(
  windowHeight: number,
  options?: { keyboard?: boolean; compactRatio?: number; normalRatio?: number },
): number {
  const { keyboard = false, compactRatio = 0.2, normalRatio = 0.28 } = options ?? {};
  const isCompact = windowHeight <= BREAKPOINTS.height.medium;

  if (keyboard) {
    return windowHeight * (isCompact ? compactRatio * 0.65 : 0.22);
  }
  return windowHeight * (isCompact ? compactRatio : normalRatio);
}

export function getProfileImageHeight(windowHeight: number): number {
  if (windowHeight <= BREAKPOINTS.height.compact) {
    return Math.min(windowHeight * 0.26, 200);
  }
  if (windowHeight <= BREAKPOINTS.height.medium) {
    return Math.min(windowHeight * 0.3, 240);
  }
  return Math.min(windowHeight * 0.32, 270);
}
