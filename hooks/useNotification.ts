import { useCallback } from 'react';
import { useNotification as useNotificationContext } from '../components/Notification/NotificationProvider';

/**
 * 🎯 Hook para usar notificações inteligentes no app
 * 
 * Uso:
 * ```typescript
 * const { showSuccess, showError, showInfo, showWarning } = useNotification();
 * 
 * showSuccess('Operação realizada com sucesso!');
 * showError('Erro ao conectar ao servidor');
 * showInfo('Bem-vindo de volta!');
 * showWarning('Você tem questões pendentes');
 * ```
 */
export const useNotification = () => {
  const { showNotification } = useNotificationContext();

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({ type: 'success', message, title });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string) => {
    showNotification({ type: 'error', message, title });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({ type: 'info', message, title });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({ type: 'warning', message, title });
  }, [showNotification]);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

