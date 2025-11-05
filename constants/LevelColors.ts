/**
 * Cores padronizadas para os níveis do usuário
 * Mantém consistência visual em todo o app
 */

export const LevelColors = {
  aprendiz: {
    primary: '#0087D3',      // Azul - cor principal (cor da marca)
    secondary: '#E8F4FD',    // Azul muito claro - fundo
    accent: '#C6E8FF',       // Azul médio - elementos secundários
    text: '#0087D3',         // Azul escuro - texto
    icon: '#0087D3',         // Azul claro - ícones
    border: '#0087D3',       // Azul claro - bordas
    shadow: '#0087D3',       // Azul claro - sombras
  },
  virtuoso: {
    primary: '#5A8BB8',      // Azul-prateado - cor principal
    secondary: '#F0F4F8',    // Azul muito claro - fundo
    accent: '#B8D4E8',       // Azul médio - elementos secundários
    text: '#2E5B8A',         // Azul escuro - texto
    icon: '#5A8BB8',         // Azul-prateado - ícones
    border: '#5A8BB8',       // Azul-prateado - bordas
    shadow: '#5A8BB8',       // Azul-prateado - sombras
  },
  maestro: {
    primary: '#FF8C00',      // Laranja dourado - cor principal
    secondary: '#FFF4E6',    // Laranja muito claro - fundo
    accent: '#FFB366',       // Laranja médio - elementos secundários
    text: '#CC5500',         // Laranja escuro - texto
    icon: '#FF8C00',         // Laranja dourado - ícones
    border: '#FF8C00',       // Laranja dourado - bordas
    shadow: '#FF8C00',       // Laranja dourado - sombras
  },
  // Cores para nível máximo (quando todos os níveis são completados)
  maxLevel: {
    primary: '#FF6B35',      // Laranja vibrante - cor principal
    secondary: '#FFF3E0',    // Laranja muito claro - fundo
    accent: '#FFB74D',       // Laranja médio - elementos secundários
    text: '#E65100',         // Laranja escuro - texto
    icon: '#FF6B35',         // Laranja vibrante - ícones
    border: '#FF6B35',       // Laranja vibrante - bordas
    shadow: '#FF6B35',       // Laranja vibrante - sombras
  }
};

// Função helper para obter cores baseadas no nível
export const getLevelColors = (level: string) => {
  const normalizedLevel = level?.toLowerCase() || 'aprendiz';
  
  switch (normalizedLevel) {
    case 'aprendiz':
      return LevelColors.aprendiz;
    case 'virtuoso':
      return LevelColors.virtuoso;
    case 'maestro':
      return LevelColors.maestro;
    case 'nível máximo':
    case 'nivel maximo':
    case 'maximo':
      return LevelColors.maxLevel;
    default:
      return LevelColors.aprendiz;
  }
};

// Função helper para obter ícone baseado no nível
// ✅ Todos os níveis usam o ícone de estudante (chapéu de formatura) com cores diferentes
export const getLevelIcon = (level: string): string => {
  // Retorna 'school' (chapéu de estudante) para todos os níveis
  // A cor é definida pela função getLevelColors
  return 'school';
};

// Função helper para obter cor da coroa baseada no nível (compatibilidade com código existente)
export const getCrownColor = (level: string): string => {
  return getLevelColors(level).primary;
};

// Função para formatar nível com capitalização consistente
export const formatLevelDisplay = (level: string): string => {
  const normalizedLevel = level?.toLowerCase() || 'aprendiz';
  
  switch (normalizedLevel) {
    case 'aprendiz':
      return 'Aprendiz';
    case 'virtuoso':
      return 'Virtuoso';
    case 'maestro':
      return 'Maestro';
    case 'nível máximo':
    case 'nivel maximo':
    case 'maximo':
    case 'máximo':
      return 'Nível Máximo';
    default:
      return 'Aprendiz';
  }
};

