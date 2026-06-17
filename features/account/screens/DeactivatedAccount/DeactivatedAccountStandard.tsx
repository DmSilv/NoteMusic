/**
 * 🚫 Tela de Conta Desativada - Design Padrão NoteMusic
 * Exibe informações sobre conta desativada seguindo o design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import AppStyles from '@/shared/constants/theme';

interface DeactivatedAccountScreenProps {
  email?: string;
  deletionScheduledFor?: string;
  deletionReason?: string;
}

export default function DeactivatedAccountScreen({ 
  email, 
  deletionScheduledFor, 
  deletionReason 
}: DeactivatedAccountScreenProps) {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelDeletion = async () => {
    Alert.alert(
      'Cancelar Exclusão',
      'Tem certeza que deseja cancelar a exclusão da sua conta? Ela será reativada imediatamente.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar Exclusão',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiService.cancelAccountDeletion();
              Alert.alert(
                'Sucesso!',
                'Sua conta foi reativada com sucesso! Você pode fazer login novamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('LoginScreen' as never)
                  }
                ]
              );
            } catch (error: any) {
              console.error('Erro ao cancelar exclusão:', error);
              Alert.alert('Erro', error.message || 'Falha ao cancelar exclusão da conta.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('LoginScreen' as never);
    } catch (error) {
      console.error('Erro no logout:', error);
      navigation.navigate('LoginScreen' as never);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const getDaysRemaining = (dateString: string) => {
    try {
      const deletionDate = new Date(dateString);
      const now = new Date();
      const diffTime = deletionDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  const daysRemaining = deletionScheduledFor ? getDaysRemaining(deletionScheduledFor) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚫</Text>
        </View>

        <Text style={styles.title}>Conta Desativada</Text>
        
        <Text style={styles.subtitle}>
          Sua conta foi desativada devido a uma solicitação de exclusão.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📧 Email da Conta:</Text>
          <Text style={styles.infoText}>{email || 'Não informado'}</Text>
        </View>

        {deletionScheduledFor && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📅 Exclusão Agendada:</Text>
            <Text style={styles.infoText}>{formatDate(deletionScheduledFor)}</Text>
            <Text style={styles.daysRemaining}>
              {daysRemaining > 0 
                ? `⏰ ${daysRemaining} dias restantes para exclusão permanente`
                : '⚠️ Conta já deveria ter sido excluída'
              }
            </Text>
          </View>
        )}

        {deletionReason && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💭 Motivo da Exclusão:</Text>
            <Text style={styles.infoText}>{deletionReason}</Text>
          </View>
        )}

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Sua conta está desativada e não pode ser usada normalmente{'\n'}
            • Todos os dados serão removidos permanentemente após o prazo{'\n'}
            • Você pode cancelar a exclusão antes do prazo final{'\n'}
            • Após a exclusão, não será possível recuperar nenhum dado
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>O que você pode fazer:</Text>
          
          {daysRemaining > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.recoverButton]}
              onPress={handleCancelDeletion}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>🔄</Text>
                  <Text style={styles.buttonText}>Cancelar Exclusão e Reativar Conta</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.buttonIcon}>🚪</Text>
            <Text style={styles.buttonText}>Sair e Fazer Login com Outra Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.helpButton]}
            onPress={() => {
              Alert.alert(
                'Suporte',
                'Para mais informações sobre exclusão de conta, entre em contato com nosso suporte através do email: suporte.notemusic@gmail.com',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.buttonIcon}>📞</Text>
            <Text style={styles.buttonText}>Entrar em Contato com Suporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppStyles.Spacing.lg,
    paddingBottom: AppStyles.Spacing.xxxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: AppStyles.Spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: AppStyles.Typography.size.title,
    fontWeight: AppStyles.Typography.weight.bold,
    color: AppStyles.Colors.error,
    textAlign: 'center',
    marginBottom: AppStyles.Spacing.md,
    fontFamily: AppStyles.Typography.family.bold,
  },
  subtitle: {
    fontSize: AppStyles.Typography.size.md,
    color: AppStyles.Colors.textSecondary,
    textAlign: 'center',
    marginBottom: AppStyles.Spacing.xxxl,
    lineHeight: 24,
    fontFamily: AppStyles.Typography.family.regular,
  },
  infoBox: {
    backgroundColor: AppStyles.Colors.white,
    borderRadius: AppStyles.Spacing.md,
    padding: AppStyles.Spacing.lg,
    marginBottom: AppStyles.Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: AppStyles.Colors.primary,
    shadowColor: AppStyles.Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: AppStyles.Typography.size.md,
    fontWeight: AppStyles.Typography.weight.bold,
    color: AppStyles.Colors.textPrimary,
    marginBottom: AppStyles.Spacing.sm,
    fontFamily: AppStyles.Typography.family.bold,
  },
  infoText: {
    fontSize: AppStyles.Typography.size.sm,
    color: AppStyles.Colors.textSecondary,
    lineHeight: 20,
    fontFamily: AppStyles.Typography.family.regular,
  },
  daysRemaining: {
    fontSize: AppStyles.Typography.size.sm,
    color: AppStyles.Colors.error,
    fontWeight: AppStyles.Typography.weight.semiBold,
    marginTop: AppStyles.Spacing.sm,
    fontFamily: AppStyles.Typography.family.medium,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: AppStyles.Spacing.md,
    padding: AppStyles.Spacing.lg,
    marginBottom: AppStyles.Spacing.xxl,
  },
  warningTitle: {
    fontSize: AppStyles.Typography.size.md,
    fontWeight: AppStyles.Typography.weight.bold,
    color: '#856404',
    marginBottom: AppStyles.Spacing.sm,
    fontFamily: AppStyles.Typography.family.bold,
  },
  warningText: {
    fontSize: AppStyles.Typography.size.sm,
    color: '#856404',
    lineHeight: 20,
    fontFamily: AppStyles.Typography.family.regular,
  },
  optionsContainer: {
    marginTop: AppStyles.Spacing.xl,
  },
  optionsTitle: {
    fontSize: AppStyles.Typography.size.lg,
    fontWeight: AppStyles.Typography.weight.bold,
    color: AppStyles.Colors.textPrimary,
    marginBottom: AppStyles.Spacing.lg,
    textAlign: 'center',
    fontFamily: AppStyles.Typography.family.bold,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppStyles.Spacing.lg,
    borderRadius: AppStyles.Spacing.md,
    marginBottom: AppStyles.Spacing.md,
    shadowColor: AppStyles.Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recoverButton: {
    backgroundColor: AppStyles.Colors.success,
  },
  logoutButton: {
    backgroundColor: AppStyles.Colors.medium,
  },
  helpButton: {
    backgroundColor: AppStyles.Colors.primary,
  },
  buttonIcon: {
    fontSize: AppStyles.Typography.size.lg,
    marginRight: AppStyles.Spacing.sm,
  },
  buttonText: {
    color: AppStyles.Colors.white,
    fontSize: AppStyles.Typography.size.md,
    fontWeight: AppStyles.Typography.weight.semiBold,
    textAlign: 'center',
    flex: 1,
    fontFamily: AppStyles.Typography.family.medium,
  },
});



