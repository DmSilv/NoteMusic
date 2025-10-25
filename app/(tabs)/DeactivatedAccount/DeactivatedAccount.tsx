import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
  Linking,
  Clipboard,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { useNavigation } from '@react-navigation/native';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import garota_sentada from '../../../assets/images/garota_janela.png';

export default function DeactivatedAccountScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const [isLoading, setIsLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<any>(null);

  // Carregar status de exclusão
  const loadDeletionStatus = async () => {
    if (!user) return;
    try {
      const status = await apiService.getDeletionStatus();
      setDeletionStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  useEffect(() => {
    loadDeletionStatus();
  }, [user]);

  const handleCancelDeletion = async () => {
    // Verificar se ainda está dentro do prazo
    const now = new Date();
    const scheduledDate = new Date(deletionStatus?.deletionScheduledFor);
    
    if (now >= scheduledDate) {
      Alert.alert(
        '⏰ Prazo Expirado',
        'O prazo para cancelar a exclusão expirou. Sua conta já foi marcada para exclusão permanente.\n\n📧 Entre em contato com o suporte para mais informações.',
        [
          { text: 'Contatar Suporte', onPress: handleContactSupport },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      await apiService.cancelAccountDeletion();
      
      Alert.alert('Sucesso', 'Sua solicitação de exclusão foi cancelada e sua conta foi reativada.', [
        {
          text: 'Fazer Login',
          onPress: () => navigation.navigate('LoginScreen')
        }
      ]);
    } catch (error: any) {
      console.error('Erro ao cancelar exclusão:', error);
      Alert.alert('Erro', 'Não foi possível cancelar a solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    const userEmail = user?.email || 'email@exemplo.com';
    const userName = user?.name || 'Usuário';
    const scheduledDate = deletionStatus?.deletionScheduledFor
      ? new Date(deletionStatus.deletionScheduledFor).toLocaleDateString('pt-BR')
      : 'N/A';
    const deletionReason = deletionStatus?.deletionReason || 'Não informado';

    const emailSubject = encodeURIComponent('Solicitação de Reativação de Conta - NoteMusic');
    const emailBody = encodeURIComponent(`
Olá equipe do NoteMusic,

Gostaria de solicitar a reativação da minha conta que foi marcada para exclusão.

DADOS DA CONTA:
• Nome: ${userName}
• Email: ${userEmail}
• Data de exclusão agendada: ${scheduledDate}
• Motivo informado: ${deletionReason}

SOLICITAÇÃO:
Gostaria de reativar minha conta.

Por favor, entre em contato comigo para confirmar a reativação.

Atenciosamente,
${userName}
    `);

    const emailUrl = `mailto:suporte.notemusic@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    Alert.alert(
      '📧 Contatar Suporte',
      'Vamos abrir seu aplicativo de email com uma mensagem pré-preenchida contendo seus dados e a solicitação de reativação.',
      [
        { 
          text: 'Abrir Email', 
          onPress: () => {
            Linking.openURL(emailUrl).catch(() => {
              Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email. Por favor, envie um email manualmente para: suporte.notemusic@gmail.com');
            });
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleGoToLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleCopyEmail = () => {
    Clipboard.setString('suporte.notemusic@gmail.com');
    Alert.alert('Email copiado!', 'suporte.notemusic@gmail.com');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Processando...</Text>
      </View>
    );
  }

  const scheduledDate = deletionStatus?.deletionScheduledFor
    ? new Date(deletionStatus.deletionScheduledFor).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const daysRemaining = deletionStatus?.deletionScheduledFor
    ? Math.ceil((new Date(deletionStatus.deletionScheduledFor).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const isWithinGracePeriod = daysRemaining > 0;

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0087D3" 
        translucent={false}
        animated={true}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header com saudação amigável */}
          <View style={styles.header}>
            <TitleComponent 
              title="Olá! 👋" 
              subtitle="Sua conta está temporariamente desativada" 
              color="#666" 
              FontFamily="Roboto-Light" 
              MarginRight={24} 
              MarginTop={20} 
            />
          </View>

          {/* Alerta de prazo expirado */}
          {!isWithinGracePeriod && (
            <View style={styles.expiredAlert}>
              <MaterialCommunityIcons name="clock-alert" size={24} color="#FF6B35" />
              <Text style={styles.expiredAlertText}>Prazo para reativação expirado</Text>
            </View>
          )}

          {/* Card principal com informações */}
          <View style={styles.mainCard}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FF9800" />
              <Text style={styles.statusTitle}>Status da Conta</Text>
            </View>
            
            <Text style={styles.statusText}>
              {isWithinGracePeriod ? (
                <>
                  Sua conta foi marcada para exclusão, mas ainda há tempo para reativá-la! 
                  Você tem <Text style={styles.highlightText}>{daysRemaining} dias</Text> restantes.
                </>
              ) : (
                <>
                  O prazo para cancelar a exclusão expirou. Sua conta foi marcada para exclusão permanente.
                  <Text style={styles.expiredText}> Entre em contato com o suporte para mais informações.</Text>
                </>
              )}
            </Text>
            
            <View style={styles.dateInfo}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>Data de exclusão: {scheduledDate}</Text>
            </View>
            
            {deletionStatus?.deletionReason && (
              <View style={styles.reasonInfo}>
                <MaterialCommunityIcons name="message-text" size={16} color="#666" />
                <Text style={styles.reasonText}>Motivo: {deletionStatus.deletionReason}</Text>
              </View>
            )}
          </View>

          {/* Card de opções */}
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>💡 O que você pode fazer?</Text>
            
            <View style={styles.optionItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.optionText}>
                <Text style={styles.boldText}>Reativar sua conta</Text> - Cancelar a exclusão e voltar a usar o app normalmente
              </Text>
            </View>
            
            <View style={styles.optionItem}>
              <MaterialCommunityIcons name="help-circle" size={20} color="#2196F3" />
              <Text style={styles.optionText}>
                <Text style={styles.boldText}>Contatar suporte</Text> - Para esclarecer dúvidas ou problemas
              </Text>
            </View>
            
            <View style={styles.optionItem}>
              <MaterialCommunityIcons name="clock" size={20} color="#FF9800" />
              <Text style={styles.optionText}>
                <Text style={styles.boldText}>Aguardar</Text> - Sua conta será excluída na data agendada
              </Text>
            </View>
          </View>

          {/* Botões de ação */}
          <View style={styles.buttonContainer}>
            {isWithinGracePeriod && (
              <PrimaryButton
                onPress={handleCancelDeletion}
                styleWidth={{ width: windowWidth * 0.85 }}
                title="✨ Reativar Minha Conta"
                disabled={isLoading}
              />
            )}
            
            
            <TouchableOpacity
              style={[styles.supportButton, { width: windowWidth * 0.85 }]}
              onPress={handleContactSupport}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="email" size={20} color="#2196F3" />
              <Text style={styles.supportButtonText}>Contatar Suporte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.loginButton, { width: windowWidth * 0.85 }]}
              onPress={handleGoToLogin}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#666" />
              <Text style={styles.loginButtonText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>

          {/* Card de ajuda */}
          <View style={styles.helpCard}>
            <View style={styles.helpHeader}>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
            </View>
            <Text style={styles.helpText}>
              Se você não solicitou a exclusão da sua conta ou tem dúvidas sobre este processo, 
              nossa equipe de suporte está aqui para ajudar!
            </Text>
            <View style={styles.contactInfo}>
              <MaterialCommunityIcons name="email" size={16} color="#4CAF50" />
              <Text style={styles.contactText}>suporte.notemusic@gmail.com</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyEmail}
              >
                <MaterialCommunityIcons name="content-copy" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto-Regular',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    fontFamily: 'Roboto-Bold',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
    fontFamily: 'Roboto-Regular',
  },
  highlightText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  expiredText: {
    color: '#FF6B35',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Roboto-Regular',
  },
  reasonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Roboto-Regular',
  },
  optionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto-Bold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
    fontFamily: 'Roboto-Regular',
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  supportButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  loginButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  loginButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  helpCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    fontFamily: 'Roboto-Bold',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
    fontFamily: 'Roboto-Regular',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#E8F5E8',
  },
  expiredAlert: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredAlertText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
});