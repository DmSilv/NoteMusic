import { scale, verticalScale } from '../utils/responsive';

// Design System - Spacing
export const spacing = {
  // Base spacing units
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),

  // Vertical spacing (for height-based scaling)
  vxs: verticalScale(4),
  vsm: verticalScale(8),
  vmd: verticalScale(16),
  vlg: verticalScale(24),
  vxl: verticalScale(32),
  vxxl: verticalScale(48),
  vxxxl: verticalScale(64),

  // Component-specific spacing
  component: {
    card: {
      padding: scale(16),
      margin: scale(8),
      borderRadius: scale(12),
    },
    button: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(24),
      borderRadius: scale(8),
    },
    input: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderRadius: scale(8),
    },
    header: {
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(20),
    },
  },

  // Layout spacing
  layout: {
    screen: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
    },
    section: {
      marginVertical: verticalScale(24),
    },
    item: {
      marginVertical: verticalScale(8),
    },
  },

  // Grid system
  grid: {
    gutter: scale(16),
    column: scale(8),
  },
};

// Spacing utilities
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size] || spacing.md;
};

export const createSpacing = (horizontal: number, vertical: number) => {
  return {
    paddingHorizontal: scale(horizontal),
    paddingVertical: verticalScale(vertical),
  };
};

export const createMargin = (horizontal: number, vertical: number) => {
  return {
    marginHorizontal: scale(horizontal),
    marginVertical: verticalScale(vertical),
  };
}; 