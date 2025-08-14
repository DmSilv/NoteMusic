import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { User, LoginData, RegisterData, UpdateUserData } from '../../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UpdateUserData) => Promise<void>;
  checkAuth: () => Promise<void>;
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

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('@NoteMusic:user');
      const token = await AsyncStorage.getItem('@NoteMusic:token');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        // Não verificar token automaticamente para evitar erros
        console.log('Usuário carregado do storage');
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

  const login = async (loginData: LoginData) => {
    try {
      const response = await apiService.login(loginData);
      setUser(response.user);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await apiService.register(registerData);
      setUser(response.user);
      await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro ao fazer registro:', error);
      throw error;
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
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 