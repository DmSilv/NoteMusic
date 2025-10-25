import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { User, LoginData, RegisterData, UpdateUserData } from '../../services/api';
import { processError } from '../../utils/errorHandler';

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
      const savedPassword = await AsyncStorage.getItem('@NoteMusic:savedPassword');
      const shouldAutoLogin = await AsyncStorage.getItem('@NoteMusic:autoLogin');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        // Não verificar token automaticamente para evitar erros
        console.log('Usuário carregado do storage');
      } 
      // Se temos credenciais salvas e a opção de auto login está ativa
      else if (shouldAutoLogin === 'true' && savedEmail && savedPassword) {
        console.log('Tentando login automático com credenciais salvas');
        try {
          // Não chamar login diretamente para evitar loops
          const response = await apiService.login({
            email: savedEmail,
            password: savedPassword
          });
          
          setUser(response.user);
          console.log('✅ Login automático realizado com sucesso');
        } catch (loginError: any) {
          // Verificar se é erro de conta desativada
          if (loginError.message?.includes('desativada') || 
              loginError.message?.includes('desativado') ||
              loginError.message?.includes('conta foi desativada') ||
              loginError.message?.includes('Sua conta foi desativada')) {
            console.log('⚠️ Conta desativada detectada no login automático - redirecionando para tela apropriada');
            // Limpar credenciais salvas para evitar tentativas futuras
            await AsyncStorage.removeItem('@NoteMusic:savedEmail');
            await AsyncStorage.removeItem('@NoteMusic:savedPassword');
            await AsyncStorage.removeItem('@NoteMusic:autoLogin');
            // Marcar que uma conta desativada foi detectada
            setDeactivatedAccountDetected(true);
            // Não definir usuário, deixar que a tela de login trate o redirecionamento
          } else {
            console.error('Erro ao tentar login automático:', loginError);
            // Não mostrar erro para o usuário, apenas falhar silenciosamente
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do storage:', error);
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
      
      console.log('🔄 Tentando fazer login...');
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
      
      setUser(response.user);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(response.user));
      
      // Se opção "Lembrar" está marcada, salvar credenciais
      if (rememberMe) {
        console.log('📝 Salvando credenciais para auto login');
        await AsyncStorage.setItem('@NoteMusic:savedEmail', loginData.email);
        await AsyncStorage.setItem('@NoteMusic:savedPassword', loginData.password);
        await AsyncStorage.setItem('@NoteMusic:autoLogin', 'true');
      } else {
        // Limpar credenciais salvas se opção não marcada
        await AsyncStorage.removeItem('@NoteMusic:savedEmail');
        await AsyncStorage.removeItem('@NoteMusic:savedPassword');
        await AsyncStorage.removeItem('@NoteMusic:autoLogin');
      }
      
      // Reset contador de tentativas em caso de sucesso
      setLoginAttempts(0);
      console.log('✅ Login realizado com sucesso');
      
      // Retornar informações sobre senha temporária se existir
      return {
        requirePasswordChange: response.requirePasswordChange,
        warning: response.warning
      };
    } catch (error: any) {
      console.error('❌ Erro ao fazer login:', error);
      
      // Processar erro com sistema de tratamento
      const processedError = processError(error);
      throw new Error(processedError.message);
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    console.log('🔍 AuthContext: Iniciando registro...');
    console.log('📤 AuthContext: Dados recebidos:', registerData);
    
    try {
      console.log('🌐 AuthContext: Chamando apiService.register...');
      const response = await apiService.register(registerData);
      
      console.log('✅ AuthContext: Resposta da API:', response);
      
      setUser(response.user);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(response.user));
      
      console.log('✅ AuthContext: Registro concluído com sucesso!');
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no registro:', error);
      console.error('❌ AuthContext: Tipo do erro:', typeof error);
      console.error('❌ AuthContext: Mensagem:', error?.message);
      
      // Processar erro com sistema de tratamento
      const processedError = processError(error);
      console.error('❌ AuthContext: Erro processado:', processedError);
      
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
      await AsyncStorage.removeItem('@NoteMusic:user');
      await AsyncStorage.removeItem('@NoteMusic:token');
      setUser(null);
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