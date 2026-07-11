import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image
} from 'react-native';
import { appAlert } from '@/shared/utils/appAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import Input from '@/shared/components/form/Input/Input';
import eyeIcon from '@/assets/images/eye.png';
import eyeOffIcon from '@/assets/images/eye-off.png';

export default function AccountDeletionScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulário, 2: Confirmação final
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

  const handleRequestDeletion = async () => {
    if (!user) {
      appAlert('Erro', 'Usuário não encontrado.');
      return;
    }

    if (!password || confirmation !== 'EXCLUIR CONTA') {
      appAlert('Erro', 'Para confirmar a exclusão, digite exatamente "EXCLUIR CONTA" no campo de confirmação.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.requestAccountDeletion({ password, confirmation, reason });
      
      appAlert('Sucesso', 'Sua conta foi marcada para exclusão e será permanentemente removida em 7 dias.', [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('LoginScreen');
            } catch (error) {
              console.error('Erro no logout:', error);
              navigation.navigate('LoginScreen');
            }
          }
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao solicitar exclusão:', error);
      
      // Tratamento de erro simples
      appAlert('Erro', 'Não foi possível processar a solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!user) return;
    
    appAlert(
      'Cancelar Exclusão',
      'Tem certeza que deseja cancelar a solicitação de exclusão da sua conta?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiService.cancelAccountDeletion();
              appAlert('Sucesso', 'Sua solicitação de exclusão foi cancelada e sua conta foi reativada.');
              loadDeletionStatus();
            } catch (error: any) {
              console.error('Erro ao cancelar exclusão:', error);
              appAlert('Erro', 'Não foi possível cancelar a solicitação. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
    } else {
      // Usar navegação segura para voltar
      navigation.navigate('ProfileHome');
    }
  };

  const renderForm = () => (
    <View style={styles.containerForm}>
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Aviso Importante</Text>
        <Text style={styles.warningText}>
          A exclusão da sua conta é permanente e removerá todos os seus dados. Esta ação não pode ser desfeita.
          Após a solicitação, sua conta será desativada e excluída permanentemente em 7 dias.
        </Text>
      </View>

      <SubTitleComponent 
        subtitle={'Sua Senha'} 
        color={'#A3A3A3'} 
        MarginTop={24} 
        FontFamily={''} 
        MarginRight={0} 
      />
      <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
        <Input 
          onChangeText={setPassword}
          placeholder={"Digite sua senha"} 
          secureTextEntry={!showPassword} 
          styleWidth={{ width: windowWidth * 0.85 }} 
          value={password}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
          <Image
            source={showPassword ? eyeIcon : eyeOffIcon}
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <SubTitleComponent 
        subtitle={'Confirmação (digite "EXCLUIR CONTA")'} 
        color={'#A3A3A3'} 
        MarginTop={16} 
        FontFamily={''} 
        MarginRight={0} 
      />
      <Input 
        onChangeText={setConfirmation}
        placeholder={'Digite "EXCLUIR CONTA"'} 
        secureTextEntry={false} 
        styleWidth={{ width: windowWidth * 0.85 }} 
        value={confirmation}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <SubTitleComponent 
        subtitle={'Motivo (Opcional)'} 
        color={'#A3A3A3'} 
        MarginTop={16} 
        FontFamily={''} 
        MarginRight={0} 
      />
      <TextInput
        style={[styles.reasonInput, { width: windowWidth * 0.85 }]}
        placeholder="Por que você está excluindo sua conta? (máx. 500 caracteres)"
        multiline
        numberOfLines={4}
        value={reason}
        onChangeText={setReason}
        maxLength={500}
        textAlignVertical="top"
      />

      <View style={styles.buttonContainer}>
        <PrimaryButton
          onPress={() => setStep(2)}
          styleWidth={{ width: windowWidth * 0.85 }}
          title="Continuar para Confirmação"
          disabled={isLoading || !password || confirmation !== 'EXCLUIR CONTA'}
        />
        
        <TouchableOpacity
          style={[styles.cancelButton, { width: windowWidth * 0.85 }]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.containerForm}>
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>🚨 CONFIRMAÇÃO FINAL 🚨</Text>
        <Text style={styles.warningText}>
          Você está prestes a solicitar a exclusão permanente da sua conta.
          Esta ação é **IRREVERSÍVEL** após o período de 7 dias.
          Sua conta será desativada imediatamente.
        </Text>
        {reason ? (
          <Text style={styles.warningText}>
            **Motivo informado:** {reason}
          </Text>
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          onPress={handleRequestDeletion}
          styleWidth={{ width: windowWidth * 0.85 }}
          title="CONFIRMAR EXCLUSÃO"
          disabled={isLoading}
        />
        
        <TouchableOpacity
          style={[styles.cancelButton, { width: windowWidth * 0.85 }]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusCard = () => {
    const scheduledDate = deletionStatus?.deletionScheduledFor
      ? new Date(deletionStatus.deletionScheduledFor).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    return (
      <View style={styles.containerForm}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>⚠️ Exclusão de Conta Pendente</Text>
          <Text style={styles.statusText}>
            Sua conta está marcada para exclusão. Ela será removida permanentemente em:{' '}
            <Text style={styles.boldText}>{scheduledDate}</Text>.
          </Text>
          <Text style={styles.statusText}>
            Você pode cancelar esta solicitação a qualquer momento antes da data agendada.
          </Text>
          
          <PrimaryButton
            onPress={handleCancelDeletion}
            styleWidth={{ width: windowWidth * 0.85 }}
            title="Cancelar Exclusão"
            disabled={isLoading}
          />
        </View>
      </View>
    );
  };

  if (isLoading && !deletionStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando status da conta...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >

          <TitleComponent 
            title="Excluir Conta" 
            subtitle="Esta ação é permanente e não pode ser desfeita." 
            color="#A3A3A3" 
            FontFamily="Roboto-Light" 
            MarginRight={24} 
            MarginTop={40} 
          />

          {deletionStatus?.deletionRequested ? renderStatusCard() : (step === 1 ? renderForm() : renderConfirmation())}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignSelf: 'center'
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerForm: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: -45,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  reasonInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#343A40',
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
    fontFamily: 'Roboto-Bold',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  statusText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
    fontFamily: 'Roboto-Regular',
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
    fontFamily: 'Roboto-Regular',
  },
});