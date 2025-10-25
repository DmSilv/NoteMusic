// Cores do StatusBar para diferentes telas
export const STATUS_BAR_COLORS = {
  // Cores principais do app
  PRIMARY: '#0087D3',
  SECONDARY: '#76B0F1',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  
  // Cores neutras
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#666666',
  LIGHT_GRAY: '#F8F9FA',
  
  // Cores específicas para diferentes tipos de tela
  LOGIN: '#0087D3',
  REGISTER: '#0087D3',
  HOME: '#0087D3',
  QUIZ: '#4CAF50',
  RESULTS_SUCCESS: '#4CAF50',
  RESULTS_ERROR: '#F44336',
  PROFILE: '#0087D3',
  SETTINGS: '#666666'
} as const;

// Configurações padrão do StatusBar
export const DEFAULT_STATUS_BAR_CONFIG = {
  backgroundColor: STATUS_BAR_COLORS.PRIMARY,
  barStyle: 'light-content' as const,
  translucent: false
} as const;

export default STATUS_BAR_COLORS;
