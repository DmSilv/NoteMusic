/**
 * 🗑️ Tela de Exclusão de Conta - Versão Simplificada
 * Interface básica para gerenciar exclusão de conta
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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../../services/api';

export default function AccountDeletionScreen() {
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestDeletion = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para excluir sua conta.');
      return;
    }
    
    if (!password || confirmation !== 'EXCLUIR CONTA') {
      Alert.alert('Erro', 'Por favor, digite sua senha e confirme digitando "EXCLUIR CONTA".');
      return;
    }

    setIsLoading(true);
    
    try {
      await apiService.requestAccountDeletion({ 
        password, 
        confirmation, 
        reason 
      });
      
      Alert.alert(
        'Solicitação Enviada',
        'Sua conta foi marcada para exclusão e será permanentemente removida em 7 dias. Você será deslogado.'
      );
      
      logout();
    } catch (error: any) {
      console.error('Erro ao solicitar exclusão:', error);
      Alert.alert('Erro', error.message || 'Falha ao solicitar exclusão da conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Ionicons name="warning-outline" size={80} color="#FF6B6B" style={styles.icon} />
        
        <Text style={styles.title}>Excluir Conta</Text>
        
        <Text style={styles.description}>
          A exclusão da sua conta é permanente e removerá todos os seus dados. 
          Esta ação não pode ser desfeita.
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Sua Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Confirmação (digite "EXCLUIR CONTA"):</Text>
          <TextInput
            style={styles.input}
            placeholder='Digite "EXCLUIR CONTA"'
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Motivo (Opcional):</Text>
          <TextInput
            style={[styles.input, styles.reasonInput]}
            placeholder="Por que você está excluindo sua conta? (máx. 500 caracteres)"
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleRequestDeletion}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Solicitar Exclusão da Conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});



