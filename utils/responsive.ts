import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Responsive scaling functions
export const scale = (size: number) => {
  const newSize = size * (screenWidth / baseWidth);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const verticalScale = (size: number) => {
  const newSize = size * (screenHeight / baseHeight);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size: number, factor = 0.5) => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Device size helpers
export const isSmallDevice = screenWidth < 375;
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
export const isLargeDevice = screenWidth >= 414;
export const isTablet = screenWidth >= 768;

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
};

// Responsive font sizes
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(18),
  xxl: scale(20),
  xxxl: scale(24),
  title: scale(28),
  largeTitle: scale(32),
};

// Responsive padding/margin helpers
export const responsivePadding = (horizontal: number, vertical: number) => ({
  paddingHorizontal: scale(horizontal),
  paddingVertical: verticalScale(vertical),
});

export const responsiveMargin = (top: number = 0, bottom: number = 0, left: number = 0, right: number = 0) => ({
  marginTop: verticalScale(top),
  marginBottom: verticalScale(bottom),
  marginLeft: scale(left),
  marginRight: scale(right),
});

// Responsive width/height helpers
export const responsiveWidth = (percentage: number) => screenWidth * (percentage / 100);
export const responsiveHeight = (percentage: number) => screenHeight * (percentage / 100);

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  full: scale(50),
};

// Screen dimensions
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
};

// Responsive button sizes
export const buttonSizes = {
  small: {
    height: verticalScale(36),
    paddingHorizontal: scale(16),
    fontSize: fontSize.sm,
  },
  medium: {
    height: verticalScale(48),
    paddingHorizontal: scale(24),
    fontSize: fontSize.md,
  },
  large: {
    height: verticalScale(56),
    paddingHorizontal: scale(32),
    fontSize: fontSize.lg,
  },
};

// Responsive input sizes
export const inputSizes = {
  small: {
    height: verticalScale(40),
    fontSize: fontSize.sm,
    paddingHorizontal: scale(12),
  },
  medium: {
    height: verticalScale(48),
    fontSize: fontSize.md,
    paddingHorizontal: scale(16),
  },
  large: {
    height: verticalScale(56),
    fontSize: fontSize.lg,
    paddingHorizontal: scale(20),
  },
};

// Responsive card sizes
export const cardSizes = {
  small: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  medium: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  large: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
};

// Responsive shadow
export const shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: scale(3),
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.5),
    elevation: scale(5),
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(5),
    elevation: scale(8),
  },
};

// Responsive layout helpers
export const layout = {
  headerHeight: verticalScale(60),
  bottomTabHeight: verticalScale(80),
  safeAreaTop: verticalScale(44),
  safeAreaBottom: verticalScale(34),
};

// Responsive grid helpers
export const grid = {
  columns: isTablet ? 2 : 1,
  gutter: spacing.md,
  margin: spacing.lg,
};

// Responsive image sizes
export const imageSizes = {
  small: {
    width: scale(60),
    height: scale(60),
  },
  medium: {
    width: scale(80),
    height: scale(80),
  },
  large: {
    width: scale(120),
    height: scale(120),
  },
  xlarge: {
    width: scale(200),
    height: scale(200),
  },
};

// Responsive icon sizes
export const iconSizes = {
  small: scale(16),
  medium: scale(24),
  large: scale(32),
  xlarge: scale(48),
};

// Responsive breakpoints
export const breakpoints = {
  phone: 375,
  largePhone: 414,
  tablet: 768,
  largeTablet: 1024,
};

// Responsive media queries (simplified for React Native)
export const isPhone = screenWidth < breakpoints.tablet;
export const isTabletDevice = screenWidth >= breakpoints.tablet;

// Responsive typography scale
export const typography = {
  h1: {
    fontSize: fontSize.largeTitle,
    lineHeight: verticalScale(40),
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: fontSize.title,
    lineHeight: verticalScale(32),
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: fontSize.xxxl,
    lineHeight: verticalScale(28),
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: fontSize.xxl,
    lineHeight: verticalScale(24),
    fontWeight: '600' as const,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: verticalScale(20),
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: verticalScale(16),
    fontWeight: 'normal' as const,
  },
  button: {
    fontSize: fontSize.md,
    lineHeight: verticalScale(20),
    fontWeight: '600' as const,
  },
}; 