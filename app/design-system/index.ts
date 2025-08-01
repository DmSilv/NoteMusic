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
export { colors, getColor } from './colors';
export { typography, getTextStyle, createTextStyle } from './typography';
export { spacing, getSpacing, createSpacing, createMargin } from './spacing';
export { 
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