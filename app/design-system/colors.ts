// Design System - Colors
export const colors = {
  // Primary Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#0087D3', // Main brand color
    600: '#0A8CD6',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary Colors
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#E5944A', // Accent color
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Text Colors
  text: {
    primary: '#232323',
    secondary: '#545454',
    tertiary: '#A3A3A3',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F0F8FF',
    card: 'rgba(0, 163, 255, 0.04)',
    challenge: 'rgba(0, 162, 255, 0.09)',
  },

  // Status Colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Gradients
  gradients: {
    primary: ['#0087D3', '#0A8CD6'],
    secondary: ['#E5944A', '#FB8C00'],
    background: ['#FFFFFF', '#F8F9FA'],
  },
};

// Color utilities
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let current: any = colors;
  
  for (const key of path) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return colors.primary[500]; // Fallback
    }
  }
  
  return current;
}; 