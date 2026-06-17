import { useState, useCallback } from 'react';

export interface UseAsyncOperationResult<T = any> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  execute: (operation: () => Promise<T>) => Promise<T | void>;
  reset: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

/**
 * Hook personalizado para gerenciar operações assíncronas
 * Centraliza loading states, error handling e data management
 */
const useAsyncOperation = <T = any>(): UseAsyncOperationResult<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await operation();
      
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Async operation error:', err);
      throw err; // Re-throw para permitir handling específico
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  const setErrorManually = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setError: setErrorManually,
    clearError,
  };
};

export default useAsyncOperation;
