import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Design Tokens
export const Colors = {
  primary: '#0A8CD6',
  primaryLight: '#C6E8FF',
  primaryDark: '#0087D3',
  secondary: '#43BBFF',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#E5944A',
  text: {
    primary: '#131313',
    secondary: '#545454',
    tertiary: '#A3A3A3',
    white: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F1F1',
    tertiary: 'rgba(0, 163, 255, 0.04)',
  },
  border: {
    light: '#EDEDED',
    medium: '#F1F1F1',
  }
};

export const Typography = {
  fontFamily: {
    roboto: {
      light: 'Roboto-Light',
      regular: 'Roboto-Regular',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    poppins: {
      regular: 'Poppins-Regular',
      medium: 'Poppins-Medium',
      semiBold: 'Poppins-SemiBold',
      bold: 'Poppins-Bold',
    }
  },
  fontSize: {
    xs: Math.max(10, screenWidth * 0.025),
    sm: Math.max(12, screenWidth * 0.03),
    md: Math.max(14, screenWidth * 0.035),
    lg: Math.max(16, screenWidth * 0.04),
    xl: Math.max(18, screenWidth * 0.045),
    xxl: Math.max(20, screenWidth * 0.05),
    xxxl: Math.max(24, screenWidth * 0.06),
  }
};

export const Spacing = {
  xs: Math.max(4, screenWidth * 0.01),
  sm: Math.max(8, screenWidth * 0.02),
  md: Math.max(12, screenWidth * 0.03),
  lg: Math.max(16, screenWidth * 0.04),
  xl: Math.max(20, screenWidth * 0.05),
  xxl: Math.max(24, screenWidth * 0.06),
  xxxl: Math.max(32, screenWidth * 0.08),
};

export const BorderRadius = {
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  full: 100,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
};

// Responsive helpers
export const Responsive = {
  screenWidth,
  screenHeight,
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  
  // Responsive sizing
  getResponsiveSize: (small: number, medium: number, large: number) => {
    if (screenWidth < 375) return small;
    if (screenWidth < 414) return medium;
    return large;
  },
  
  // Responsive padding
  getResponsivePadding: (horizontal: number, vertical: number) => ({
    paddingHorizontal: Math.max(horizontal, screenWidth * 0.05),
    paddingVertical: Math.max(vertical, screenHeight * 0.02),
  }),
  
  // Responsive margins
  getResponsiveMargin: (top: number = 0, bottom: number = 0, left: number = 0, right: number = 0) => ({
    marginTop: Math.max(top, screenHeight * 0.01),
    marginBottom: Math.max(bottom, screenHeight * 0.01),
    marginLeft: Math.max(left, screenWidth * 0.02),
    marginRight: Math.max(right, screenWidth * 0.02),
  }),
};

// Layout constants
export const Layout = {
  headerHeight: Math.max(60, screenHeight * 0.08),
  bottomTabHeight: Math.max(80, screenHeight * 0.1),
  buttonHeight: Math.max(48, screenHeight * 0.06),
  inputHeight: Math.max(48, screenHeight * 0.06),
  cardPadding: Math.max(16, screenWidth * 0.04),
}; 