import { useState, useCallback } from 'react';
import { validateEmail as validateEmailDomain } from '@/shared/utils/validation';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
}

// Nomes de campo (chaves em inglês usadas no código) traduzidos para um rótulo
// descritivo em português, com artigo e gênero, para montar mensagens de erro
// naturais (em vez de expor a chave crua, ex.: "confirmPassword é obrigatório").
const FIELD_LABELS: { [key: string]: { label: string; article: 'o' | 'a' } } = {
  email: { label: 'e-mail', article: 'o' },
  name: { label: 'nome', article: 'o' },
  password: { label: 'senha', article: 'a' },
  currentPassword: { label: 'senha atual', article: 'a' },
  newPassword: { label: 'nova senha', article: 'a' },
  confirmPassword: { label: 'confirmação de senha', article: 'a' },
  resetCode: { label: 'código de verificação', article: 'o' },
};

function getFieldInfo(field: string): { label: string; article: 'o' | 'a' } {
  return FIELD_LABELS[field] || { label: field, article: 'o' };
}

export interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface UseFormValidationResult {
  formState: FormState;
  errors: { [key: string]: string };
  isValid: boolean;
  setValue: (field: string, value: string) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  validateField: (field: string) => boolean;
  validateAll: () => boolean;
  resetForm: () => void;
  markFieldTouched: (field: string) => void;
}

const useFormValidation = (
  initialValues: { [key: string]: string },
  validationRules: { [key: string]: ValidationRule }
): UseFormValidationResult => {
  // Inicializar estado do formulário
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      initialState[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
      };
    });
    return initialState;
  });

  // Validar um campo específico
  const validateField = useCallback((field: string): boolean => {
    const value = formState[field]?.value || '';
    const rules = validationRules[field];
    
    if (!rules) return true;

    let error = '';
    const { label, article } = getFieldInfo(field);
    const genderSuffix = article === 'a' ? 'a' : 'o';

    // Verificar se é obrigatório
    if (rules.required && !value.trim()) {
      error = `Informe ${article} ${label}`;
    }
    // Verificar comprimento mínimo
    else if (rules.minLength && value.length < rules.minLength) {
      error = `${article === 'a' ? 'A' : 'O'} ${label} deve ter pelo menos ${rules.minLength} caracteres`;
    }
    // Verificar comprimento máximo
    else if (rules.maxLength && value.length > rules.maxLength) {
      error = `${article === 'a' ? 'A' : 'O'} ${label} deve ter no máximo ${rules.maxLength} caracteres`;
    }
    // Verificar padrão
    else if (rules.pattern && !rules.pattern.test(value)) {
      error = `${article === 'a' ? 'A' : 'O'} ${label} informad${genderSuffix} é inválid${genderSuffix}`;
    }
    // ✅ Verificar email com validação de domínio
    else if (rules.email) {
      const emailValidation = validateEmailDomain(value);
      if (!emailValidation.isValid) {
        error = emailValidation.error || 'E-mail inválido';
      }
    }
    // Validação customizada
    else if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        error = customError;
      }
    }

    // Atualizar estado com erro
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));

    return !error;
  }, [formState, validationRules]);

  // Validar todos os campos
  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    Object.keys(formState).forEach(field => {
      const isFieldValid = validateField(field);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });
    return isFormValid;
  }, [formState, validateField]);

  // Definir valor de campo
  const setValue = useCallback((field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: '', // Limpar erro ao digitar
      },
    }));
  }, []);

  // Definir erro manualmente
  const setError = useCallback((field: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  // Limpar erro
  const clearError = useCallback((field: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: '',
      },
    }));
  }, []);

  // Marcar campo como tocado
  const markFieldTouched = useCallback((field: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
      },
    }));
  }, []);

  // Resetar formulário
  const resetForm = useCallback(() => {
    const resetState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      resetState[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
      };
    });
    setFormState(resetState);
  }, [initialValues]);

  // Computar propriedades derivadas
  const errors = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].error;
    return acc;
  }, {} as { [key: string]: string });

  const isValid = Object.values(formState).every(field => !field.error);

  return {
    formState,
    errors,
    isValid,
    setValue,
    setError,
    clearError,
    validateField,
    validateAll,
    resetForm,
    markFieldTouched,
  };
};

export default useFormValidation;
