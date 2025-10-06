import { VALIDATION_RULES } from '../types/UserStats';

// Validação de nome
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }
  
  if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return { isValid: false, error: `Nome deve ter pelo menos ${VALIDATION_RULES.NAME.MIN_LENGTH} caracteres` };
  }
  
  if (name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { isValid: false, error: `Nome deve ter no máximo ${VALIDATION_RULES.NAME.MAX_LENGTH} caracteres` };
  }
  
  if (!VALIDATION_RULES.NAME.PATTERN.test(name)) {
    return { isValid: false, error: 'Nome deve conter apenas letras e espaços' };
  }
  
  return { isValid: true };
};

// Validação de email
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'E-mail é obrigatório' };
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return { isValid: false, error: 'E-mail inválido' };
  }
  
  return { isValid: true };
};

// Validação de senha
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { isValid: false, error: `Senha deve ter pelo menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres` };
  }
  
  if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return { isValid: false, error: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número' };
  }
  
  return { isValid: true };
};

// Validação de confirmação de senha
export const validatePasswordConfirmation = (password: string, confirmation: string): { isValid: boolean; error?: string } => {
  if (!confirmation) {
    return { isValid: false, error: 'Confirmação de senha é obrigatória' };
  }
  
  if (password !== confirmation) {
    return { isValid: false, error: 'Senhas não coincidem' };
  }
  
  return { isValid: true };
};

// Validação de formulário completo
export interface FormData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  currentPassword?: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  currentPassword?: string;
}

export const validateForm = (formData: FormData, isUpdate: boolean = false): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  let isValid = true;

  // Validar nome
  if (formData.name !== undefined) {
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
      isValid = false;
    }
  }

  // Validar email
  if (formData.email !== undefined) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
      isValid = false;
    }
  }

  // Validar senha (apenas se fornecida)
  if (formData.password && formData.password.trim()) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
      isValid = false;
    }

    // Validar confirmação de senha
    if (formData.confirmPassword) {
      const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
      if (!confirmValidation.isValid) {
        errors.confirmPassword = confirmValidation.error;
        isValid = false;
      }
    }
  }

  // Para atualizações, validar senha atual se estiver alterando email ou senha
  if (isUpdate) {
    const isChangingEmailOrPassword = 
      (formData.email && formData.email.trim()) || 
      (formData.password && formData.password.trim());
    
    if (isChangingEmailOrPassword && (!formData.currentPassword || !formData.currentPassword.trim())) {
      errors.currentPassword = 'Senha atual é obrigatória para alterar email ou senha';
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Utilitários de formatação
export const formatName = (name: string): string => {
  return name.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const formatEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// Validação de nível de usuário
export const validateUserLevel = (level: string): boolean => {
  const validLevels = ['aprendiz', 'virtuoso', 'maestro'];
  return validLevels.includes(level.toLowerCase());
};

// Validação de meta semanal
export const validateWeeklyGoal = (goal: number): { isValid: boolean; error?: string } => {
  if (goal < 1) {
    return { isValid: false, error: 'Meta semanal deve ser pelo menos 1' };
  }
  
  if (goal > 20) {
    return { isValid: false, error: 'Meta semanal deve ser no máximo 20' };
  }
  
  return { isValid: true };
};

// Validação de ID de módulo
export const validateModuleId = (moduleId: string | undefined): boolean => {
  if (!moduleId) {
    return false;
  }
  
  // Verificar se é um ObjectId válido do MongoDB (24 caracteres hexadecimais)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(moduleId);
};

// Validação de ID de quiz
export const validateQuizId = (quizId: string | undefined): boolean => {
  if (!quizId) {
    return false;
  }
  
  // Verificar se é um ObjectId válido do MongoDB (24 caracteres hexadecimais)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(quizId);
};

// Mensagem de erro para ID inválido
export const getInvalidIdMessage = (type: 'module' | 'quiz'): string => {
  return `ID de ${type === 'module' ? 'módulo' : 'quiz'} inválido`;
};