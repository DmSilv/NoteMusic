import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { User, LoginData, RegisterData, UpdateUserData, normalizeUser } from '@/services/api';
import { processError } from '@/shared/utils/errorHandler';
import { clearUserSessionCache } from '@/shared/utils/sessionCache';

function devLog(...args: unknown[]) {
  if (__DEV__) {
    console.log(...args);
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginInProgress: boolean;
  loginAttempts: number;
  deactivatedAccountDetected: boolean; // ADDED
  login: (loginData: LoginData, rememberMe?: boolean) => Promise<{ requirePasswordChange?: boolean; warning?: string }>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UpdateUserData) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  changeTempPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  checkAccountStatus: () => Promise<{ isDeactivated: boolean; deletionInfo?: any }>;
  clearDeactivatedFlag: () => void; // ADDED
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number>(0);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isLoginInProgress, setIsLoginInProgress] = useState<boolean>(false);
  const [deactivatedAccountDetected, setDeactivatedAccountDetected] = useState<boolean>(false); // ADDED

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('@NoteMusic:user');
      const token = await AsyncStorage.getItem('@NoteMusic:token');
      const savedEmail = await AsyncStorage.getItem('@NoteMusic:savedEmail');
      const shouldRememberEmail = await AsyncStorage.getItem('@NoteMusic:rememberEmail');

      // Migração: remover senha salva de versões antigas (inseguro)
      await AsyncStorage.multiRemove([
        '@NoteMusic:savedPassword',
        '@NoteMusic:autoLogin',
      ]);
      
      if (userData && token) {
        const parsed = JSON.parse(userData);
        const normalized = normalizeUser(parsed);
        if (normalized?.id) {
          setUser(normalized);
        } else {
          await AsyncStorage.removeItem('@NoteMusic:user');
        }
      } else if (shouldRememberEmail === 'true' && savedEmail) {
        // Apenas pré-preenche e-mail — senha nunca é persistida localmente
        devLog('E-mail salvo encontrado para pré-preenchimento');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao carregar usuário do storage:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const user = await apiService.getProfile();
      setUser(user);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Não fazer logout automático para evitar loops
    }
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setUser(profile);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(profile));
      console.log('✅ Perfil sincronizado do backend:', profile.level, profile.id);
    } catch (error) {
      console.error('Erro ao atualizar perfil do backend:', error);
      throw error;
    }
  };

  const login = async (loginData: LoginData, rememberMe: boolean = false) => {
    // Evitar múltiplas tentativas simultâneas
    if (isLoginInProgress) {
      throw new Error('Login já está em andamento. Aguarde...');
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - lastLoginAttempt;
    
    // Rate limiting: máximo 1 tentativa a cada 3 segundos
    if (timeSinceLastAttempt < 3000) {
      throw new Error('Aguarde 3 segundos antes de tentar novamente');
    }
    
    // Rate limiting: máximo 3 tentativas por minuto
    if (loginAttempts >= 3 && timeSinceLastAttempt < 60000) {
      throw new Error('Muitas tentativas de login. Aguarde 1 minuto antes de tentar novamente');
    }
    
    try {
      setIsLoginInProgress(true);
      setLastLoginAttempt(now);
      setLoginAttempts(prev => prev + 1);

      await clearUserSessionCache();
      
      const response = await apiService.login(loginData);
      
      // Verificar se a conta está desativada
      try {
        const deletionStatus = await apiService.getDeletionStatus();
        if (deletionStatus.status?.deletionRequested) {
          // Conta está desativada, não fazer login normal
          throw new Error('ACCOUNT_DEACTIVATED');
        }
      } catch (statusError: any) {
        if (statusError.message === 'ACCOUNT_DEACTIVATED') {
          throw statusError;
        }
        // Se não for erro de conta desativada, continuar normalmente
      }

      let currentUser = response.user;
      try {
        currentUser = await apiService.getProfile();
      } catch (profileError) {
        console.warn('Não foi possível atualizar perfil após login, usando resposta do login:', profileError);
      }
      
      setUser(currentUser);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(currentUser));
      
      // "Lembrar-me" persiste apenas o e-mail — nunca a senha
      if (rememberMe) {
        await AsyncStorage.setItem('@NoteMusic:savedEmail', loginData.email);
        await AsyncStorage.setItem('@NoteMusic:rememberEmail', 'true');
      } else {
        await AsyncStorage.removeItem('@NoteMusic:savedEmail');
        await AsyncStorage.removeItem('@NoteMusic:rememberEmail');
      }
      
      setLoginAttempts(0);
      
      // Retornar informações sobre senha temporária se existir
      return {
        requirePasswordChange: response.requirePasswordChange,
        warning: response.warning
      };
    } catch (error: any) {
      const processedError = processError(error);
      throw new Error(processedError.message);
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      await clearUserSessionCache();
      const response = await apiService.register(registerData);

      let currentUser = response.user;
      try {
        currentUser = await apiService.getProfile();
      } catch (profileError) {
        console.warn('Não foi possível atualizar perfil após registro:', profileError);
      }
      
      setUser(currentUser);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(currentUser));
    } catch (error: any) {
      const processedError = processError(error);
      throw new Error(processedError.message);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    }

    try {
      await clearUserSessionCache();
      await AsyncStorage.removeItem('@NoteMusic:user');
      await AsyncStorage.removeItem('@NoteMusic:token');
      setUser(null);
      setLoginAttempts(0);
      setIsLoginInProgress(false);
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
    }
  };

  const updateUser = async (userData: UpdateUserData) => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      setUser(updatedUser);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Erro ao atualizar dados do usuário:', error);
      
      // Processar erro com sistema de tratamento
      const processedError = processError(error);
      throw new Error(processedError.message);
    }
  };

  const changeTempPassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiService.updatePassword(currentPassword, newPassword);
      
      // Atualizar status do usuário após mudança de senha
      if (user) {
        const updatedUser = { ...user, tempPassword: false };
        setUser(updatedUser);
        await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha temporária:', error);
      
      // Processar erro com sistema de tratamento
      const processedError = processError(error);
      throw new Error(processedError.message);
    }
  };

  const checkAccountStatus = async (): Promise<{ isDeactivated: boolean; deletionInfo?: any }> => {
    try {
      if (!user) {
        return { isDeactivated: false };
      }

      const deletionStatus = await apiService.getDeletionStatus();
      
      if (deletionStatus.status?.deletionRequested) {
        return {
          isDeactivated: true,
          deletionInfo: {
            email: user.email,
            deletionScheduledFor: deletionStatus.status.deletionScheduledFor,
            deletionReason: deletionStatus.status.deletionReason,
            daysRemaining: deletionStatus.status.daysRemaining
          }
        };
      }

      return { isDeactivated: false };
    } catch (error) {
      console.error('Erro ao verificar status da conta:', error);
      return { isDeactivated: false };
    }
  };

  const clearDeactivatedFlag = () => {
    setDeactivatedAccountDetected(false);
  };

  const value = {
    user,
    isLoading,
    isLoginInProgress,
    loginAttempts,
    deactivatedAccountDetected, // ADDED
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshUserProfile,
    changeTempPassword,
    checkAccountStatus,
    clearDeactivatedFlag, // ADDED
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 