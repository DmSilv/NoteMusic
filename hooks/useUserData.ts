import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import apiService from '../services/api';

interface UserData {
  name: string;
  level: string;
  stats?: any;
}

// Cache global para evitar múltiplas requisições
const userDataCache = new Map<string, { data: UserData; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minuto

export const useUserData = (refreshInterval: number = 300000) => { // Aumentado para 5 minutos
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadUserData = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) return;

    const cacheKey = user.id || user.email;
    
    // Verificar cache primeiro
    if (!forceRefresh && userDataCache.has(cacheKey)) {
      const cached = userDataCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Usando dados do cache');
        setUserData(cached.data);
        return;
      }
    }

    // Evitar requisições muito frequentes
    if (!forceRefresh && lastUpdate && (Date.now() - lastUpdate.getTime()) < 30000) {
      console.log('⏰ Evitando requisição muito frequente');
      return;
    }

    try {
      setIsLoading(true);
      const stats = await apiService.getUserStats();
      
      const newUserData = {
        name: user.name || "Usuário",
        level: stats?.level || user.level || "Aprendiz",
        stats: stats
      };
      
      // Atualizar cache
      userDataCache.set(cacheKey, {
        data: newUserData,
        timestamp: Date.now()
      });
      
      setUserData(newUserData);
      setLastUpdate(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      
      // Fallback para dados básicos do contexto
      const fallbackData = {
        name: user.name || "Usuário",
        level: user.level || "Aprendiz"
      };
      
      setUserData(fallbackData);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Removido lastUpdate das dependências para evitar loop

  // Carregar dados inicialmente
  useEffect(() => {
    if (user) {
      loadUserData(true);
    }
  }, [user]); // Removido loadUserData das dependências

  // Atualizar dados periodicamente com backoff em caso de erro
  useEffect(() => {
    if (!user) return;

    // Backoff exponencial mais agressivo para evitar erro 429
    const baseInterval = refreshInterval;
    const backoffMultiplier = Math.pow(2, retryCount); // 2x, 4x, 8x, 16x...
    const backoffInterval = Math.min(baseInterval * backoffMultiplier, 1800000); // Max 30 minutos

    console.log(`⏰ Próxima atualização em ${Math.round(backoffInterval / 1000)}s (tentativa ${retryCount + 1})`);

    const interval = setInterval(() => {
      loadUserData();
    }, backoffInterval);

    return () => clearInterval(interval);
  }, [user, refreshInterval, retryCount]); // Removido loadUserData das dependências

  // Função para forçar atualização manual
  const refreshUserData = useCallback(() => {
    loadUserData(true);
  }, []); // Removido loadUserData das dependências

  // Função para limpar cache
  const clearCache = useCallback(() => {
    if (user) {
      const cacheKey = user.id || user.email;
      userDataCache.delete(cacheKey);
    }
  }, []); // Removido user das dependências

  return {
    userData,
    isLoading,
    lastUpdate,
    retryCount,
    refreshUserData,
    clearCache
  };
};
