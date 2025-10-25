/**
 * 🔄 Hook para Refresh Inteligente de Dados
 * Gerencia atualizações automáticas com controle de rate limiting
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface RefreshConfig {
  interval?: number; // Intervalo base em ms
  maxRetries?: number; // Máximo de tentativas
  backoffMultiplier?: number; // Multiplicador de backoff
  maxInterval?: number; // Intervalo máximo
  pauseOnBackground?: boolean; // Pausar quando app está em background
}

interface RefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  retryCount: number;
  nextRefreshIn: number; // ms até próxima atualização
}

export const useIntelligentRefresh = (
  refreshFunction: () => Promise<void>,
  config: RefreshConfig = {}
) => {
  const {
    interval = 60000, // 1 minuto
    maxRetries = 5,
    backoffMultiplier = 1.5,
    maxInterval = 300000, // 5 minutos
    pauseOnBackground = true
  } = config;

  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    retryCount: 0,
    nextRefreshIn: interval
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  // Calcular próximo intervalo com backoff inteligente
  const calculateNextInterval = useCallback((retryCount: number): number => {
    const multiplier = Math.min(Math.pow(backoffMultiplier, retryCount), 4);
    return Math.min(interval * multiplier, maxInterval);
  }, [interval, backoffMultiplier, maxInterval]);

  // Executar refresh
  const executeRefresh = useCallback(async () => {
    if (state.isRefreshing) return;

    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      
      await refreshFunction();
      
      // Sucesso - resetar contador de retry
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: new Date(),
        retryCount: 0,
        nextRefreshIn: interval
      }));
      
    } catch (error) {
      console.error('❌ Erro no refresh automático:', error);
      
      // Erro - incrementar retry count
      const newRetryCount = Math.min(state.retryCount + 1, maxRetries);
      const nextInterval = calculateNextInterval(newRetryCount);
      
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        retryCount: newRetryCount,
        nextRefreshIn: nextInterval
      }));
    }
  }, [refreshFunction, state.isRefreshing, state.retryCount, interval, maxRetries, calculateNextInterval]);

  // Configurar intervalo automático
  const setupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (pauseOnBackground && appStateRef.current !== 'active') {
      return;
    }

    const nextInterval = calculateNextInterval(state.retryCount);
    
    intervalRef.current = setInterval(() => {
      executeRefresh();
    }, nextInterval);

    setState(prev => ({ ...prev, nextRefreshIn: nextInterval }));
  }, [executeRefresh, calculateNextInterval, state.retryCount, pauseOnBackground]);

  // Refresh manual
  const refreshNow = useCallback(async () => {
    await executeRefresh();
    setupInterval(); // Reconfigurar após refresh manual
  }, [executeRefresh, setupInterval]);

  // Pausar refresh
  const pauseRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Resumir refresh
  const resumeRefresh = useCallback(() => {
    setupInterval();
  }, [setupInterval]);

  // Monitorar mudanças de estado do app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      
      if (pauseOnBackground) {
        if (nextAppState === 'active') {
          resumeRefresh();
        } else {
          pauseRefresh();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [pauseOnBackground, resumeRefresh, pauseRefresh]);

  // Configurar intervalo inicial
  useEffect(() => {
    setupInterval();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setupInterval]);

  return {
    ...state,
    refreshNow,
    pauseRefresh,
    resumeRefresh,
    isActive: intervalRef.current !== null
  };
};



