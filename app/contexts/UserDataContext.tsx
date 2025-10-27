import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { UserStats } from '../types/UserStats';

interface UserDataState {
  userStats: UserStats | null;
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  retryCount: number;
  isRefreshing: boolean;
}

type UserDataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_STATS'; payload: UserStats }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' }
  | { type: 'UPDATE_LAST_UPDATE' };

interface UserDataContextType {
  state: UserDataState;
  refreshUserData: () => Promise<void>;
  updateUserStats: (updates: Partial<UserStats>) => void;
  clearError: () => void;
}

// Estado inicial
const initialState: UserDataState = {
  userStats: null,
  isLoading: false,
  lastUpdate: null,
  error: null,
  retryCount: 0,
  isRefreshing: false,
};

// Reducer
const userDataReducer = (state: UserDataState, action: UserDataAction): UserDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER_STATS':
      return { 
        ...state, 
        userStats: action.payload, 
        error: null, 
        retryCount: 0,
        lastUpdate: new Date()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    case 'UPDATE_LAST_UPDATE':
      return { ...state, lastUpdate: new Date() };
    default:
      return state;
  }
};

// Contexto
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Provider
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userDataReducer, initialState);

  // Dados padrão para fallback
  const getDefaultStats = (): UserStats => ({
    level: 'Aprendiz',
    progress: 0,
    streak: 0,
    achievements: [],
    challenges: [],
    totalModules: 16,
    completedModules: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    nextAchievement: 'Complete seu primeiro módulo',
    totalPoints: 0,
    averageScorePercentage: 0,
    bestCategory: null,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyDays: 0,
    quizPassRate: 0,
    levelProgress: {
      current: 'Aprendiz',
      next: 'Virtuoso',
      percentage: 0,
      requirements: 'Complete 16 de 22 módulos Aprendiz (75%) para avançar'
    },
    weeklyProgressDetail: {
      current: 0,
      goal: 5,
      percentage: 0
    },
    recentActivity: {
      lastStudyDate: null,
      modulesLast7Days: 0,
      quizzesLast7Days: 0
    }
  });

  // Função para carregar dados do usuário (versão otimizada)
  const loadUserData = useCallback(async (forceRefresh: boolean = false) => {
    // Evitar requisições muito frequentes (exceto se forçado)
    if (!forceRefresh && state.lastUpdate && (Date.now() - state.lastUpdate.getTime()) < 15000) {
      console.log('⏰ Evitando requisição muito frequente (15s)');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Por enquanto, usar dados padrão
      // TODO: Implementar chamada para API quando necessário
      dispatch({ type: 'SET_USER_STATS', payload: getDefaultStats() });
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      
      // Em caso de erro, usar dados padrão
      dispatch({ type: 'SET_USER_STATS', payload: getDefaultStats() });
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados' });
      dispatch({ type: 'INCREMENT_RETRY' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.lastUpdate]);

  // Função para atualizar estatísticas localmente
  const updateUserStats = useCallback((updates: Partial<UserStats>) => {
    if (state.userStats) {
      const updatedStats = { ...state.userStats, ...updates };
      dispatch({ type: 'SET_USER_STATS', payload: updatedStats });
    }
  }, [state.userStats]);

  // Função para refresh manual
  const refreshUserData = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    await loadUserData(true);
  }, [loadUserData]);

  // Função para limpar erro
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Auto-refresh com backoff em caso de erro
  useEffect(() => {
    const baseInterval = 120000; // 2 minutos
    const backoffInterval = Math.min(baseInterval * Math.pow(1.5, state.retryCount), 600000); // Max 10 minutos

    const interval = setInterval(() => {
      loadUserData();
    }, backoffInterval);

    return () => clearInterval(interval);
  }, [state.retryCount]); // Removido loadUserData das dependências

  const contextValue: UserDataContextType = {
    state,
    refreshUserData,
    updateUserStats,
    clearError,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

// Hook para usar o contexto
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData deve ser usado dentro de um UserDataProvider');
  }
  return context;
};

// Hook para dados específicos (compatibilidade)
export const useUserStats = () => {
  const { state } = useUserData();
  return {
    userStats: state.userStats,
    isLoading: state.isLoading,
    error: state.error,
    isRefreshing: state.isRefreshing,
  };
};
