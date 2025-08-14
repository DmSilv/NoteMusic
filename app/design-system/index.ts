// Import all design system modules
import { colors, getColor } from './colors';
import { typography, getTextStyle, createTextStyle } from './typography';
import { spacing, getSpacing, createSpacing, createMargin } from './spacing';
import { 
  scale, 
  verticalScale, 
  moderateScale, 
  screenWidth, 
  screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  fontSize,
  borderRadius
} from '../utils/responsive';

// Design System - Main Export
export * from './colors';
export * from './spacing';
export * from './typography';

// Default export para evitar warnings de rota
export { default as colors } from './colors';
export { default as spacing } from './spacing';
export { default as typography } from './typography';

// Design System Theme
export const theme = {
  colors,
  typography,
  spacing,
  responsive: {
    scale,
    verticalScale,
    moderateScale,
    screenWidth,
    screenHeight,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    fontSize,
    borderRadius,
  },
};

// Type definitions
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  responsive: {
    scale: typeof scale;
    verticalScale: typeof verticalScale;
    moderateScale: typeof moderateScale;
    screenWidth: typeof screenWidth;
    screenHeight: typeof screenHeight;
    isSmallDevice: typeof isSmallDevice;
    isMediumDevice: typeof isMediumDevice;
    isLargeDevice: typeof isLargeDevice;
    fontSize: typeof fontSize;
    borderRadius: typeof borderRadius;
  };
}

// Utility functions
export const createTheme = (customTheme?: Partial<Theme>): Theme => {
  return {
    ...theme,
    ...customTheme,
  };
};

export const getThemeColor = (colorPath: string) => {
  return getColor(colorPath);
};

export const getThemeSpacing = (size: keyof typeof spacing) => {
  return getSpacing(size);
};

export const getThemeTextStyle = (styleName: string) => {
  return getTextStyle(styleName);
}; 