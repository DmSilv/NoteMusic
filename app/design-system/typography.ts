import { scale, verticalScale } from '../utils/responsive';

// Design System - Typography
export const typography = {
  // Font Families
  fontFamily: {
    primary: {
      light: 'Roboto-Light',
      regular: 'Roboto-Regular',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    secondary: {
      light: 'Poppins-Light',
      regular: 'Poppins-Regular',
      medium: 'Poppins-Medium',
      bold: 'Poppins-Bold',
      semiBold: 'Poppins-SemiBold',
    },
  },

  // Font Sizes
  fontSize: {
    xs: scale(12),
    sm: scale(14),
    base: scale(16),
    lg: scale(18),
    xl: scale(20),
    '2xl': scale(24),
    '3xl': scale(30),
    '4xl': scale(36),
    '5xl': scale(48),
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },

  // Text Styles
  textStyles: {
    // Headings
    h1: {
      fontSize: scale(36),
      fontFamily: 'Poppins-Bold',
      lineHeight: 1.2,
      color: '#232323',
    },
    h2: {
      fontSize: scale(30),
      fontFamily: 'Poppins-Bold',
      lineHeight: 1.3,
      color: '#232323',
    },
    h3: {
      fontSize: scale(24),
      fontFamily: 'Poppins-SemiBold',
      lineHeight: 1.3,
      color: '#232323',
    },
    h4: {
      fontSize: scale(20),
      fontFamily: 'Poppins-Medium',
      lineHeight: 1.4,
      color: '#232323',
    },
    h5: {
      fontSize: scale(18),
      fontFamily: 'Poppins-Medium',
      lineHeight: 1.4,
      color: '#232323',
    },
    h6: {
      fontSize: scale(16),
      fontFamily: 'Poppins-Medium',
      lineHeight: 1.4,
      color: '#232323',
    },

    // Body Text
    body1: {
      fontSize: scale(16),
      fontFamily: 'Roboto-Regular',
      lineHeight: 1.6,
      color: '#545454',
    },
    body2: {
      fontSize: scale(14),
      fontFamily: 'Roboto-Regular',
      lineHeight: 1.5,
      color: '#545454',
    },
    body3: {
      fontSize: scale(12),
      fontFamily: 'Roboto-Regular',
      lineHeight: 1.4,
      color: '#545454',
    },

    // Caption
    caption: {
      fontSize: scale(12),
      fontFamily: 'Roboto-Light',
      lineHeight: 1.4,
      color: '#A3A3A3',
    },

    // Button Text
    button: {
      fontSize: scale(16),
      fontFamily: 'Roboto-Bold',
      lineHeight: 1.2,
      color: '#FFFFFF',
    },
    buttonSmall: {
      fontSize: scale(14),
      fontFamily: 'Roboto-Bold',
      lineHeight: 1.2,
      color: '#FFFFFF',
    },

    // Label
    label: {
      fontSize: scale(14),
      fontFamily: 'Roboto-Medium',
      lineHeight: 1.4,
      color: '#232323',
    },
  },
};

// Typography utilities
export const getTextStyle = (styleName: string) => {
  return typography.textStyles[styleName as keyof typeof typography.textStyles] || typography.textStyles.body1;
};

export const createTextStyle = (fontSize: number, fontFamily: string, color: string, lineHeight?: number) => {
  return {
    fontSize: scale(fontSize),
    fontFamily,
    color,
    lineHeight: lineHeight || 1.4,
  };
}; 