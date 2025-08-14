/**
 * Utilitários de validação para o NoteMusic
 */

/**
 * Verifica se uma string é um ObjectId válido do MongoDB
 * ObjectIds têm 24 caracteres hexadecimais
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // Verificar se é um ObjectId válido (24 caracteres hexadecimais)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

/**
 * Valida se um ID de módulo é válido
 */
export const validateModuleId = (moduleId: string): boolean => {
  if (!moduleId) return false;
  
  // IDs inválidos conhecidos
  const invalidIds = ['default', 'daily-challenge', 'test-module', 'mock'];
  
  if (invalidIds.includes(moduleId)) return false;
  
  return isValidObjectId(moduleId);
};

/**
 * Valida se um ID de quiz é válido
 */
export const validateQuizId = (quizId: string): boolean => {
  if (!quizId) return false;
  
  // IDs inválidos conhecidos
  const invalidIds = ['default', 'daily-challenge', 'test-module', 'mock'];
  
  if (invalidIds.includes(quizId)) return false;
  
  return isValidObjectId(quizId);
};

/**
 * Gera uma mensagem de erro específica para IDs inválidos
 */
export const getInvalidIdMessage = (id: string, type: 'módulo' | 'quiz'): string => {
  if (!id) {
    return `ID do ${type} não fornecido.`;
  }
  
  if (id === 'default') {
    return `ID do ${type} inválido: "default". Verifique se o módulo foi carregado corretamente.`;
  }
  
  if (id === 'daily-challenge') {
    return `ID do ${type} inválido: "daily-challenge". Use o ID real do módulo.`;
  }
  
  if (id === 'test-module') {
    return `ID do ${type} inválido: "test-module". Use o ID real do módulo.`;
  }
  
  if (id === 'mock') {
    return `ID do ${type} inválido: "mock". Use o ID real do módulo.`;
  }
  
  return `ID do ${type} inválido: "${id}". Verifique se o módulo foi carregado corretamente.`;
};
