import { useState, useCallback } from 'react';
import { appAlert } from '@/shared/utils/appAlert';
import { processError, createSuccessMessage, ErrorMessage } from '@/shared/utils/errorHandler';

interface UseErrorHandlerReturn {
  showError: (error: any) => void;
  showSuccess: (action: string) => void;
  showCustomAlert: (title: string, message: string, type?: 'error' | 'warning' | 'info') => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [isProcessing, setIsProcessing] = useState(false);

  const showError = useCallback((error: any) => {
    console.log('🚨 Exibindo erro:', error);
    
    const errorInfo = processError(error);
    
    appAlert(
      errorInfo.title,
      errorInfo.message,
      [
        {
          text: 'OK',
          style: errorInfo.type === 'warning' ? 'default' : 'destructive'
        }
      ],
      { variant: errorInfo.type === 'warning' ? 'warning' : 'error' }
    );
  }, []);

  const showSuccess = useCallback((action: string) => {
    const successInfo = createSuccessMessage(action);
    
    appAlert(
      successInfo.title,
      successInfo.message,
      [{ text: 'OK', style: 'default' }],
      { variant: 'success' }
    );
  }, []);

  const showCustomAlert = useCallback((
    title: string, 
    message: string, 
    type: 'error' | 'warning' | 'info' = 'error'
  ) => {
    appAlert(
      title,
      message,
      [
        {
          text: 'OK',
          style: type === 'warning' ? 'default' : type === 'error' ? 'destructive' : 'default'
        }
      ],
      { variant: type }
    );
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  return {
    showError,
    showSuccess,
    showCustomAlert,
    isProcessing,
    setProcessing
  };
};

export default useErrorHandler;



