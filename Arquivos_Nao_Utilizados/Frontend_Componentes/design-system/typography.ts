import { scale, verticalScale } from '../utils/responsive';

// Design System - Typography
export const typography = {
  // Font families
  fontFamily: {
    primary: 'Poppins',
    secondary: 'Roboto',
    mono: 'SpaceMono',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  
  // Text styles
  text: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
      fontFamily: 'Poppins',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
      fontFamily: 'Poppins',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
      fontFamily: 'Poppins',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'Roboto',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
      fontFamily: 'Roboto',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.2,
      fontFamily: 'Poppins',
    },
  },
};

// Typography utilities
export const getTextStyle = (style: keyof typeof typography.text) => {
  return typography.text[style];
};

export const createTextStyle = (overrides: Partial<typeof typography.text.body>) => {
  return {
    ...typography.text.body,
    ...overrides,
  };
};

// Default export para evitar warnings de rota
export default typography; 