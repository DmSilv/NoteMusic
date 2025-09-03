import { scale, verticalScale } from '../utils/responsive';

// Design System - Spacing
export const spacing = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Component-specific spacing
  button: {
    padding: 12,
    margin: 8,
  },
  
  card: {
    padding: 16,
    margin: 12,
  },
  
  input: {
    padding: 12,
    margin: 8,
  },
  
  // Layout spacing
  container: {
    padding: 20,
    margin: 16,
  },
  
  section: {
    margin: 24,
    padding: 16,
  },
};

// Spacing utilities
export const getSpacing = (size: keyof typeof spacing | number) => {
  if (typeof size === 'number') return size;
  return spacing[size] || spacing.md;
};

export const createSpacing = (multiplier: number = 1) => {
  return spacing.md * multiplier;
};

export const createMargin = (direction: 'top' | 'bottom' | 'left' | 'right' | 'vertical' | 'horizontal', size: number) => {
  const spacingValue = getSpacing(size);
  
  switch (direction) {
    case 'top':
      return { marginTop: spacingValue };
    case 'bottom':
      return { marginBottom: spacingValue };
    case 'left':
      return { marginLeft: spacingValue };
    case 'right':
      return { marginRight: spacingValue };
    case 'vertical':
      return { marginVertical: spacingValue };
    case 'horizontal':
      return { marginHorizontal: spacingValue };
    default:
      return { margin: spacingValue };
  }
};

// Default export para evitar warnings de rota
export default spacing; 