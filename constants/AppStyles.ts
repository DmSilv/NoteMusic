/**
 * 🎨 Design System Unificado do NoteMusic
 * Sistema de cores, estilos e componentes padronizados
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 🎨 Paleta de Cores Padronizada
export const AppColors = {
  // Cores Primárias
  primary: '#007AFF',           // Azul principal
  primaryDark: '#0056CC',       // Azul escuro
  primaryLight: '#B3D9FF',      // Azul claro
  
  // Cores Secundárias
  secondary: '#0A8CD6',         // Azul música
  secondaryDark: '#085A94',     // Azul música escuro
  secondaryLight: '#7BBDE8',    // Azul música claro
  
  // Cores de Estado
  success: '#4CAF50',           // Verde sucesso
  warning: '#FF9800',           // Laranja aviso
  error: '#F44336',             // Vermelho erro
  info: '#2196F3',              // Azul informação
  
  // Cores Neutras
  white: '#FFFFFF',
  black: '#000000',
  dark: '#131313',              // Preto principal
  medium: '#545454',            // Cinza médio
  light: '#F8F9FA',             // Cinza claro
  border: '#E9ECEF',            // Bordas
  divider: '#F1F1F1',           // Divisores
  
  // Cores de Background
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundCard: '#FFFFFF',
  
  // Cores de Texto
  textPrimary: '#131313',
  textSecondary: '#545454',
  textLight: '#6C757D',
  textWhite: '#FFFFFF',
  
  // Cores Especiais
  accent: '#E5944A',            // Laranja música
  gradient: ['#007AFF', '#0A8CD6'], // Gradiente padrão
};

// 📏 Espaçamentos Responsivos
export const AppSpacing = {
  xs: Math.max(4, screenWidth * 0.01),
  sm: Math.max(8, screenWidth * 0.02),
  md: Math.max(12, screenWidth * 0.03),
  lg: Math.max(16, screenWidth * 0.04),
  xl: Math.max(20, screenWidth * 0.05),
  xxl: Math.max(24, screenWidth * 0.06),
  xxxl: Math.max(32, screenWidth * 0.08),
};

// 🔤 Tipografia Padronizada
export const AppTypography = {
  // Tamanhos
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
  
  // Famílias
  family: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    poppins: 'Poppins-Regular',
    poppinsBold: 'Poppins-Bold',
  },
  
  // Pesos
  weight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// 🎯 Componentes de Botão Padronizados
export const AppButtonStyles = {
  // Botão Primário
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
  
  // Botão Secundário
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
  
  // Botão Outline
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
  
  // Botão Ghost
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

// 📝 Textos de Botão Padronizados
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

// 📦 Cards Padronizados
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

// 🎨 Estilos de Input
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

// 🏠 Layout Padrão
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

// ✨ Animações e Transições
export const AppAnimations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    ease: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

// 📱 Responsividade
export const AppResponsive = {
  isSmallScreen: screenWidth < 350,
  isMediumScreen: screenWidth >= 350 && screenWidth < 400,
  isLargeScreen: screenWidth >= 400,
  
  // Funções utilitárias
  wp: (percentage: number) => (screenWidth * percentage) / 100,
  hp: (percentage: number) => (screenHeight * percentage) / 100,
  
  // Breakpoints
  breakpoints: {
    sm: 350,
    md: 400,
    lg: 500,
  },
};

export default {
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
};
