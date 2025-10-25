/**
 * 🔒 Componente de Proteção de Rota
 * Redireciona usuários deslogados para tela de login
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Se houver erro na verificação, redirecionar para login
        router.replace('/LoginScreen');
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    // Se não está carregando e não há usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('🔒 Usuário não autenticado, redirecionando para login...');
      router.replace('/LoginScreen');
    }
  }, [user, isLoading]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Se não há usuário, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  // Se há usuário, renderizar conteúdo protegido
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});



