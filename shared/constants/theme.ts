/**
 * Design system unificado do NoteMusic
 * Consolida AppStyles + LevelColors
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- Paleta geral ---

export const AppColors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#B3D9FF',
  secondary: '#0A8CD6',
  secondaryDark: '#085A94',
  secondaryLight: '#7BBDE8',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  dark: '#131313',
  medium: '#545454',
  light: '#F8F9FA',
  border: '#E9ECEF',
  divider: '#F1F1F1',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundCard: '#FFFFFF',
  textPrimary: '#131313',
  textSecondary: '#545454',
  textLight: '#6C757D',
  textWhite: '#FFFFFF',
  accent: '#E5944A',
  gradient: ['#007AFF', '#0A8CD6'],
};

export const AppSpacing = {
  xs: Math.max(4, screenWidth * 0.01),
  sm: Math.max(8, screenWidth * 0.02),
  md: Math.max(12, screenWidth * 0.03),
  lg: Math.max(16, screenWidth * 0.04),
  xl: Math.max(20, screenWidth * 0.05),
  xxl: Math.max(24, screenWidth * 0.06),
  xxxl: Math.max(32, screenWidth * 0.08),
};

export const AppTypography = {
  size: {
    xs: Math.max(12, screenWidth * 0.03),
    sm: Math.max(14, screenWidth * 0.035),
    md: Math.max(16, screenWidth * 0.04),
    lg: Math.max(18, screenWidth * 0.045),
    xl: Math.max(20, screenWidth * 0.05),
    xxl: Math.max(24, screenWidth * 0.06),
    xxxl: Math.max(32, screenWidth * 0.08),
    title: Math.max(28, screenWidth * 0.07),
    display: Math.max(36, screenWidth * 0.09),
  },
  family: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    poppins: 'Poppins-Regular',
    poppinsBold: 'Poppins-Bold',
  },
  weight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const AppButtonStyles = {
  primary: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    borderWidth: 2,
    borderRadius: 26,
    height: Math.max(52, screenHeight * 0.065),
    paddingHorizontal: AppSpacing.xxl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  secondary: {
    backgroundColor: AppColors.success,
    borderColor: AppColors.success,
    borderWidth: 2,
    borderRadius: 26,
    height: Math.max(52, screenHeight * 0.065),
    paddingHorizontal: AppSpacing.xxl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  outline: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.primary,
    borderWidth: 2,
    borderRadius: 26,
    height: Math.max(52, screenHeight * 0.065),
    paddingHorizontal: AppSpacing.xxl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  ghost: {
    backgroundColor: AppColors.light,
    borderColor: AppColors.medium,
    borderWidth: 2,
    borderRadius: 26,
    height: Math.max(52, screenHeight * 0.065),
    paddingHorizontal: AppSpacing.xxl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};

export const AppButtonTextStyles = {
  primary: {
    color: AppColors.textWhite,
    fontSize: AppTypography.size.md,
    fontWeight: AppTypography.weight.bold,
    fontFamily: AppTypography.family.bold,
  },
  secondary: {
    color: AppColors.textWhite,
    fontSize: AppTypography.size.md,
    fontWeight: AppTypography.weight.bold,
    fontFamily: AppTypography.family.bold,
  },
  outline: {
    color: AppColors.primary,
    fontSize: AppTypography.size.md,
    fontWeight: AppTypography.weight.bold,
    fontFamily: AppTypography.family.bold,
  },
  ghost: {
    color: AppColors.medium,
    fontSize: AppTypography.size.md,
    fontWeight: AppTypography.weight.bold,
    fontFamily: AppTypography.family.bold,
  },
};

export const AppCardStyles = {
  default: {
    backgroundColor: AppColors.backgroundCard,
    borderRadius: AppSpacing.lg,
    padding: AppSpacing.xxl,
    marginBottom: AppSpacing.lg,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  elevated: {
    backgroundColor: AppColors.backgroundCard,
    borderRadius: AppSpacing.xl,
    padding: AppSpacing.xxxl,
    marginBottom: AppSpacing.xl,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  flat: {
    backgroundColor: AppColors.light,
    borderRadius: AppSpacing.md,
    padding: AppSpacing.lg,
    marginBottom: AppSpacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
};

export const AppInputStyles = {
  default: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderWidth: 2,
    borderRadius: AppSpacing.md,
    height: Math.max(48, screenHeight * 0.06),
    paddingHorizontal: AppSpacing.lg,
    fontSize: AppTypography.size.md,
    fontFamily: AppTypography.family.regular,
    color: AppColors.textPrimary,
  },
  focused: {
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    borderColor: AppColors.error,
    backgroundColor: '#FFEBEE',
  },
};

export const AppLayout = {
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: AppSpacing.lg,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: AppSpacing.lg,
    marginBottom: AppSpacing.lg,
  },
  content: {
    flex: 1,
    paddingVertical: AppSpacing.sm,
  },
  footer: {
    paddingVertical: AppSpacing.lg,
    paddingHorizontal: AppSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
};

export const AppAnimations = {
  timing: { fast: 200, normal: 300, slow: 500 },
  easing: { ease: 'ease-in-out', easeIn: 'ease-in', easeOut: 'ease-out' },
};

export const AppResponsive = {
  isSmallScreen: screenWidth < 350,
  isMediumScreen: screenWidth >= 350 && screenWidth < 400,
  isLargeScreen: screenWidth >= 400,
  wp: (percentage: number) => (screenWidth * percentage) / 100,
  hp: (percentage: number) => (screenHeight * percentage) / 100,
  breakpoints: { sm: 350, md: 400, lg: 500 },
};

// --- Cores por nível do usuário ---

export const LevelColors = {
  aprendiz: {
    primary: '#0087D3',
    secondary: '#E8F4FD',
    accent: '#C6E8FF',
    text: '#0087D3',
    icon: '#0087D3',
    border: '#0087D3',
    shadow: '#0087D3',
  },
  virtuoso: {
    primary: '#5A8BB8',
    secondary: '#F0F4F8',
    accent: '#B8D4E8',
    text: '#2E5B8A',
    icon: '#5A8BB8',
    border: '#5A8BB8',
    shadow: '#5A8BB8',
  },
  maestro: {
    primary: '#FF8C00',
    secondary: '#FFF4E6',
    accent: '#FFB366',
    text: '#CC5500',
    icon: '#FF8C00',
    border: '#FF8C00',
    shadow: '#FF8C00',
  },
  maxLevel: {
    primary: '#FF6B35',
    secondary: '#FFF3E0',
    accent: '#FFB74D',
    text: '#E65100',
    icon: '#FF6B35',
    border: '#FF6B35',
    shadow: '#FF6B35',
  },
};

export const getLevelColors = (level: string) => {
  const normalizedLevel = level?.toLowerCase() || 'aprendiz';

  switch (normalizedLevel) {
    case 'aprendiz':
      return LevelColors.aprendiz;
    case 'virtuoso':
      return LevelColors.virtuoso;
    case 'maestro':
      return LevelColors.maestro;
    case 'nível máximo':
    case 'nivel maximo':
    case 'maximo':
      return LevelColors.maxLevel;
    default:
      return LevelColors.aprendiz;
  }
};

export const getLevelIcon = (_level: string): string => 'school';

export const getCrownColor = (level: string): string => getLevelColors(level).primary;

export const formatLevelDisplay = (level: string): string => {
  const normalizedLevel = level?.toLowerCase() || 'aprendiz';

  switch (normalizedLevel) {
    case 'aprendiz':
      return 'Aprendiz';
    case 'virtuoso':
      return 'Virtuoso';
    case 'maestro':
      return 'Maestro';
    case 'nível máximo':
    case 'nivel maximo':
    case 'maximo':
    case 'máximo':
      return 'Nível Máximo';
    default:
      return 'Aprendiz';
  }
};

const theme = {
  Colors: AppColors,
  Spacing: AppSpacing,
  Typography: AppTypography,
  ButtonStyles: AppButtonStyles,
  ButtonTextStyles: AppButtonTextStyles,
  CardStyles: AppCardStyles,
  InputStyles: AppInputStyles,
  Layout: AppLayout,
  Animations: AppAnimations,
  Responsive: AppResponsive,
  LevelColors,
};

export default theme;
