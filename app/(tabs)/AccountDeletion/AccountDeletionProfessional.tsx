/**
 * 🗑️ Tela de Exclusão de Conta - Versão Profissional
 * Interface segura e profissional para gerenciar exclusão de conta
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function AccountDeletionScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulário, 2: Confirmação final

  // Validação em tempo real
  const isFormValid = password.length >= 6 && confirmation === 'EXCLUIR CONTA';
  const canProceed = isFormValid && !isLoading;

  const handleRequestDeletion = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para excluir sua conta.');
      return;
    }
    
    if (!canProceed) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    // Mostrar confirmação final
    if (step === 1) {
      setStep(2);
      return;
    }

    // Executar exclusão
    setIsLoading(true);
    
    try {
      await apiService.requestAccountDeletion({ 
        password, 
        confirmation, 
        reason: reason.trim() || 'Não informado'
      });
      
      // Sucesso - fazer logout e redirecionar
      Alert.alert(
        'Solicitação Enviada',
        'Sua conta foi marcada para exclusão e será permanentemente removida em 7 dias.',
        [
          {
            text: 'OK',
                onPress: async () => {
                  try {
                    await logout();
                    // Redirecionar para tela de login
                    navigation.navigate('LoginScreen' as never);
                  } catch (error) {
                    console.error('Erro no logout:', error);
                    // Forçar redirecionamento mesmo com erro
                    navigation.navigate('LoginScreen' as never);
                  }
                }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Erro ao solicitar exclusão:', error);
      Alert.alert('Erro', error.message || 'Falha ao solicitar exclusão da conta.');
      setStep(1); // Voltar para o formulário
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Aviso Importante</Text>
        <Text style={styles.warningText}>
          Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
        </Text>
      </View>

      <Text style={styles.label}>Sua Senha Atual:</Text>
      <TextInput
        style={[styles.input, password.length > 0 && password.length < 6 && styles.inputError]}
        placeholder="Digite sua senha atual"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="password"
      />
      {password.length > 0 && password.length < 6 && (
        <Text style={styles.errorText}>Senha deve ter pelo menos 6 caracteres</Text>
      )}

      <Text style={styles.label}>Confirmação de Exclusão:</Text>
      <TextInput
        style={[styles.input, confirmation.length > 0 && confirmation !== 'EXCLUIR CONTA' && styles.inputError]}
        placeholder='Digite exatamente: "EXCLUIR CONTA"'
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
        autoComplete="off"
      />
      {confirmation.length > 0 && confirmation !== 'EXCLUIR CONTA' && (
        <Text style={styles.errorText}>Digite exatamente "EXCLUIR CONTA"</Text>
      )}

      <Text style={styles.label}>Motivo da Exclusão (Opcional):</Text>
      <TextInput
        style={[styles.input, styles.reasonInput]}
        placeholder="Nos ajude a melhorar: por que você está excluindo sua conta?"
        multiline
        numberOfLines={4}
        value={reason}
        onChangeText={setReason}
        maxLength={500}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{reason.length}/500 caracteres</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button, 
            styles.deleteButton,
            !canProceed && styles.disabledButton
          ]}
          onPress={handleRequestDeletion}
          disabled={!canProceed}
        >
          <Text style={styles.deleteButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.confirmationContainer}>
      <View style={styles.finalWarningBox}>
        <Text style={styles.finalWarningTitle}>🚨 Confirmação Final</Text>
        <Text style={styles.finalWarningText}>
          Você está prestes a excluir permanentemente sua conta. Esta ação não pode ser desfeita.
        </Text>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Resumo da Exclusão:</Text>
        <Text style={styles.summaryText}>• Sua conta será desativada imediatamente</Text>
        <Text style={styles.summaryText}>• Todos os dados serão removidos em 7 dias</Text>
        <Text style={styles.summaryText}>• Você não poderá recuperar nada</Text>
        {reason.trim() && (
          <Text style={styles.summaryText}>• Motivo: {reason.trim()}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.finalDeleteButton]}
          onPress={handleRequestDeletion}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.finalDeleteButtonText}>EXCLUIR CONTA</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Exclusão de Conta</Text>
          
          <Text style={styles.description}>
            Tem certeza que deseja excluir sua conta? Esta ação removerá permanentemente todos os seus dados.
          </Text>

          {step === 1 ? renderForm() : renderConfirmation()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  finalWarningBox: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  finalWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#721C24',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalWarningText: {
    fontSize: 16,
    color: '#721C24',
    lineHeight: 22,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#E2E3E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF5F5',
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'right',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finalDeleteButton: {
    backgroundColor: '#721C24',
  },
  finalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
    opacity: 0.6,
  },
  confirmationContainer: {
    width: '100%',
  },
});
