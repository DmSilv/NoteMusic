/**
 * 🗑️ Tela de Exclusão de Conta - NoteMusic
 * Interface para gerenciar exclusão de conta com confirmação dupla
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../../services/api';

interface DeletionStatus {
  deletionRequested: boolean;
  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;
  deletionReason: string;
  isMarkedForDeletion: boolean;
  daysRemaining: number | null;
}

export default function AccountDeletionScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Formulário de exclusão
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadDeletionStatus();
  }, []);

  const loadDeletionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDeletionStatus();
      setDeletionStatus(response.status);
    } catch (error) {
      console.error('Erro ao carregar status de exclusão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!password.trim()) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return;
    }

    if (confirmation !== 'EXCLUIR CONTA') {
      Alert.alert('Erro', 'Digite "EXCLUIR CONTA" para confirmar');
      return;
    }

    try {
      setIsLoading(true);
      
      await apiService.requestAccountDeletion({
        password,
        confirmation,
        reason: reason.trim() || undefined
      });

      Alert.alert(
        'Solicitação Enviada',
        'Sua conta será excluída em 7 dias. Você pode cancelar a qualquer momento fazendo login novamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowDeletionModal(false);
              setPassword('');
              setConfirmation('');
              setReason('');
              loadDeletionStatus();
            }
          }
        ]
      );

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao solicitar exclusão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setIsLoading(true);
      
      await apiService.cancelAccountDeletion();

      Alert.alert(
        'Exclusão Cancelada',
        'Sua conta foi reativada e você pode continuar usando o NoteMusic normalmente.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCancelModal(false);
              loadDeletionStatus();
            }
          }
        ]
      );

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao cancelar exclusão');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !deletionStatus) {
    return (
      <>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#0087D3" 
          translucent={false}
          animated={true}
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0087D3" 
        translucent={false}
        animated={true}
      />
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exclusão de Conta</Text>
        </View>

        {/* Status da Conta */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={deletionStatus?.deletionRequested ? "warning" : "checkmark-circle"} 
              size={24} 
              color={deletionStatus?.deletionRequested ? "#FF9500" : "#34C759"} 
            />
            <Text style={styles.statusTitle}>
              {deletionStatus?.deletionRequested ? 'Exclusão Solicitada' : 'Conta Ativa'}
            </Text>
          </View>
          
          {deletionStatus?.deletionRequested && (
            <View style={styles.statusDetails}>
              <Text style={styles.statusText}>
                📅 <Text style={styles.bold}>Exclusão agendada para:</Text> {formatDate(deletionStatus.deletionScheduledFor!)}
              </Text>
              <Text style={styles.statusText}>
                ⏰ <Text style={styles.bold}>Dias restantes:</Text> {deletionStatus.daysRemaining}
              </Text>
              {deletionStatus.deletionReason && (
                <Text style={styles.statusText}>
                  📝 <Text style={styles.bold}>Motivo:</Text> {deletionStatus.deletionReason}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Aviso Importante */}
        <View style={styles.warningCard}>
          <Ionicons name="information-circle" size={24} color="#FF9500" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>⚠️ Importante</Text>
            <Text style={styles.warningText}>
              • A exclusão é permanente e irreversível{'\n'}
              • Todos os seus dados serão removidos{'\n'}
              • Você tem 7 dias para cancelar a exclusão{'\n'}
              • Após a exclusão, não será possível recuperar nada
            </Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
          {!deletionStatus?.deletionRequested ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeletionModal(true)}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Solicitar Exclusão</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.cancelButtonText}>Cancelar Exclusão</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informações Legais */}
        <View style={styles.legalCard}>
          <Text style={styles.legalTitle}>📋 Informações Legais</Text>
          <Text style={styles.legalText}>
            Esta funcionalidade está em conformidade com a LGPD (Lei Geral de Proteção de Dados) 
            e garante seu direito ao esquecimento. Todos os dados pessoais serão permanentemente 
            removidos dos nossos servidores.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Exclusão */}
      <Modal
        visible={showDeletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🗑️ Excluir Conta</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDeletionModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Para excluir sua conta, confirme sua senha e digite a confirmação solicitada.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha Atual</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha atual"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmação</Text>
              <TextInput
                style={styles.input}
                value={confirmation}
                onChangeText={setConfirmation}
                placeholder="Digite: EXCLUIR CONTA"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Motivo (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Por que você está excluindo sua conta?"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              <Text style={styles.charCount}>{reason.length}/500</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeletionModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, isLoading && styles.disabledButton]}
                onPress={handleRequestDeletion}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="trash" size={16} color="white" />
                    <Text style={styles.modalConfirmText}>Excluir Conta</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal
        visible={showCancelModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✅ Cancelar Exclusão</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCancelModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Tem certeza que deseja cancelar a exclusão da sua conta? 
              Você poderá continuar usando o NoteMusic normalmente.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelText}>Manter Exclusão</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, isLoading && styles.disabledButton]}
                onPress={handleCancelDeletion}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.modalConfirmText}>Cancelar Exclusão</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  statusDetails: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  warningCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    flexDirection: 'row',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
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
  actionsContainer: {
    margin: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  legalCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    marginLeft: 8,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AccountDeletionScreen;
