/**
 * Mapeamento de slugs de categoria para nomes amigáveis
 */

export const categoryNames: Record<string, string> = {
  'propriedades-som': 'Fundamentos do Som',
  'escalas-maiores': 'Escalas Maiores',
  'figuras-musicais': 'Figuras Musicais',
  'ritmo-ternarios': 'Ritmo Ternários',
  'compasso-simples': 'Compasso Simples',
  'andamento-dinamica': 'Andamento e Dinâmica',
  'solfegio-basico': 'Solfégio Básico',
  'articulacao-musical': 'Articulação Musical',
  'intervalos-musicais': 'Intervalos Musicais',
  'expressao-musical': 'Expressão Musical',
  'sincopa-contratempo': 'Síncopa e Contratempo',
  'compasso-composto': 'Compasso Composto',
  'geral': 'Geral'
};

/**
 * Converte um slug de categoria em nome amigável
 */
export const getCategoryDisplayName = (slug: string): string => {
  return categoryNames[slug] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converte um nome amigável de volta para slug (se necessário)
 */
export const getCategorySlug = (displayName: string): string => {
  const entry = Object.entries(categoryNames).find(([_, name]) => name === displayName);
  return entry ? entry[0] : displayName.toLowerCase().replace(/\s+/g, '-');
};

export default { categoryNames, getCategoryDisplayName, getCategorySlug };

