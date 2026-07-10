import { StyleSheet, View, Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, Switch } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import garota_sentada from '@/assets/images/garota_janela.png';
import eyeIcon from '@/assets/images/eye.png'; 
import eyeOffIcon from '@/assets/images/eye-off.png'; 
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle'; 
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import Input from '@/shared/components/form/Input/Input';
import { useAuth } from '@/contexts/AuthContext';
import useFormValidation from '@/shared/hooks/useFormValidation';
import useAsyncOperation from '@/shared/hooks/useAsyncOperation';
import useErrorHandler from '@/shared/hooks/useErrorHandler';
import { processError } from '@/shared/utils/errorHandler';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import { getIllustrationHeight } from '@/shared/constants/responsive';
import { DEFAULT_LEVEL_CHROME } from '@/shared/constants/levelTheme';

export default function LoginScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight, formFieldWidth, horizontalPadding } = useResponsiveLayout();
  const {
    login,
    user,
    isLoading,
    isLoginInProgress,
    loginAttempts,
    deactivatedAccountDetected,
    clearDeactivatedFlag,
    biometricHardwareAvailable,
    biometricLoginEnabled,
    biometricTypeLabel,
    enableBiometricLogin,
    loginWithBiometrics,
  } = useAuth();
  
  // Estados para formulário
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricLoginInProgress, setIsBiometricLoginInProgress] = useState(false);
  
  // Hook de validação de formulário
  const { formState, errors, setValue, validateField, validateAll } = useFormValidation(
    { email: '', password: '' },
    { 
      email: { required: true, email: true }, 
      password: { required: true, minLength: 6 } 
    }
  );

  // Hook para operações assíncronas
  const { execute } = useAsyncOperation();
  
  // Hook para tratamento de erros
  const { showError } = useErrorHandler();

  // Verificar se há credenciais salvas
  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@NoteMusic:savedEmail');
        const rememberEmail = await AsyncStorage.getItem('@NoteMusic:rememberEmail');

        if (savedEmail && rememberEmail === 'true') {
          setValue('email', savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Erro ao verificar e-mail salvo:', error);
        }
      }
    };

    checkSavedCredentials();
  }, []);

  // Detectar quando conta desativada é detectada
  useEffect(() => {
    if (deactivatedAccountDetected) {
      console.log('🚨 Conta desativada detectada, redirecionando...');
      navigation.navigate('DeactivatedAccount', { email: formState.email.value });
      clearDeactivatedFlag(); // Limpar a flag após usar
    }
  }, [deactivatedAccountDetected, formState.email.value, navigation, clearDeactivatedFlag]);

  const handlePressRemenberPassword = () => {
    navigation.navigate('RemenberPassword');
  };

  const handleClearSavedCredentials = async () => {
    Alert.alert(
      'Remover e-mail salvo',
      'Deseja remover o e-mail salvo? Você precisará digitá-lo novamente na próxima vez.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@NoteMusic:savedEmail');
              await AsyncStorage.removeItem('@NoteMusic:rememberEmail');
              
              setValue('email', '');
              setRememberMe(false);
              
              Alert.alert('Pronto!', 'O e-mail salvo foi removido.');
            } catch (error) {
              console.error('Erro ao limpar credenciais:', error);
              Alert.alert('Ops!', 'Não foi possível remover os dados salvos.');
            }
          }
        }
      ]
    );
  };

  const handlePressProfile = async () => {
    if (!validateAll()) {
      return;
    }

    try {
      const result = await execute(
        () => login({ email: formState.email.value, password: formState.password.value }, rememberMe)
      );

      if (result.requirePasswordChange) {
        Alert.alert('Bem-vindo!', 'Por favor, altere sua senha temporária.');
        navigation.navigate('ChangePassword');
        return;
      }

      const goToProfileHome = () => {
        // Login bem-sucedido - navegar SEM alert e SEM histórico
        navigation.reset({
          index: 0,
          routes: [{ name: 'ProfileHome' }],
        });
      };

      // Oferece ativar biometria só quando o aparelho suporta e ela ainda não
      // está ativada — evita perguntar de novo a cada login.
      if (biometricHardwareAvailable && !biometricLoginEnabled) {
        Alert.alert(
          `Entrar com ${biometricTypeLabel}?`,
          `Você pode usar ${biometricTypeLabel} para entrar mais rápido nas próximas vezes, sem digitar a senha.`,
          [
            { text: 'Agora não', style: 'cancel', onPress: goToProfileHome },
            {
              text: 'Ativar',
              onPress: async () => {
                try {
                  await enableBiometricLogin();
                } catch (biometricError: any) {
                  Alert.alert('Ops!', biometricError.message || 'Não foi possível ativar a biometria.');
                } finally {
                  goToProfileHome();
                }
              },
            },
          ]
        );
      } else {
        goToProfileHome();
      }
    } catch (error: any) {
      if (error.message === 'ACCOUNT_DEACTIVATED') {
        navigation.navigate('DeactivatedAccount', { email: formState.email.value });
        return;
      }

      const processed = processError(error);
      Alert.alert(processed.title, processed.message);
    }
  };

  const handleBiometricLogin = async () => {
    if (isBiometricLoginInProgress) return;

    setIsBiometricLoginInProgress(true);
    try {
      await loginWithBiometrics();
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileHome' }],
      });
    } catch (error: any) {
      Alert.alert('Não foi possível entrar', error.message || 'Tente novamente ou use sua senha.');
    } finally {
      setIsBiometricLoginInProgress(false);
    }
  };

  // Detectar teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <LevelScreenShell>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerImage}>
          <Image 
            source={garota_sentada} 
            style={[
              styles.image, 
              { 
                width: windowWidth * 0.95, 
                height: getIllustrationHeight(windowHeight, { keyboard: keyboardVisible, compactRatio: 0.22, normalRatio: 0.32 }),
              }
            ]} 
          />
        </View>

        <View style={[styles.containerForm, { paddingHorizontal: horizontalPadding }]}>
          {/* Botão discreto para limpar credenciais */}
          {rememberMe && (
            <TouchableOpacity 
              onPress={handleClearSavedCredentials} 
              style={styles.clearCredentialsButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="account-cancel" 
                size={18} 
                color="#76B0F1" 
              />
            </TouchableOpacity>
          )}
          
          <SubTitleComponent 
            subtitle={'Olá, artista!'} 
            color={'#A3A3A3'} 
            fontFamily={'Roboto-Light'} 
            marginRight={24} 
            marginTop={4} 
          />
          <TitleComponent 
            title={'Pronto para dar o play?'} 
            color={''} 
            fontFamily={''} 
            fontSize={22}
            truncate={false}
          />
          <SubTitleComponent 
            subtitle="Prepare-se para uma experiência única de aprendizado e música." 
            color="#A3A3A3" 
            fontFamily="Roboto-Light" 
            marginRight={24} 
            marginTop={4} 
          />

          <SubTitleComponent 
            subtitle={'E-mail'} 
            color={'#A3A3A3'} 
            marginTop={12} 
            fontFamily={''} 
            marginRight={0} 
          />
          <Input 
            onChangeText={(text) => setValue('email', text)}
            placeholder={"Digite seu melhor e-mail"} 
            secureTextEntry={false} 
            styleWidth={{ width: formFieldWidth }} 
            value={formState.email.value}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => validateField('email')}
          />

          <SubTitleComponent 
            subtitle={'Senha'} 
            color={'#A3A3A3'} 
            marginTop={8} 
            fontFamily={''} 
            marginRight={0} 
          />
          <View style={[styles.passwordContainer, { width: formFieldWidth }]}>
            <Input 
              onChangeText={(text) => setValue('password', text)}
              placeholder={"Digite sua senha"} 
              secureTextEntry={!showPassword} 
              styleWidth={{ width: formFieldWidth }} 
              value={formState.password.value}
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => validateField('password')}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
          
          <PrimaryButton 
            onPress={handlePressProfile} 
            title={'Acessar'} 
            styleWidth={{ width: formFieldWidth }} 
            loading={isLoginInProgress}
            disabled={isLoginInProgress || isLoading}
          />
          
          {/* Opção Lembrar-me - Com o botão primeiro e depois o texto */}
          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#D9D9D9', true: '#76B0F1' }}
              thumbColor={rememberMe ? DEFAULT_LEVEL_CHROME.primary : '#f4f3f4'}
            />
            <TouchableOpacity 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
              style={styles.rememberMeTextContainer}
            >
              <Text style={styles.rememberMeText}>Lembrar meu e-mail</Text>
            </TouchableOpacity>
          </View>
          
          {biometricHardwareAvailable && biometricLoginEnabled && (
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={[styles.biometricButton, { width: formFieldWidth }]}
              activeOpacity={0.7}
              disabled={isBiometricLoginInProgress || isLoginInProgress}
            >
              <MaterialCommunityIcons name="fingerprint" size={22} color="#0087D3" />
              <Text style={styles.biometricButtonText}>
                {isBiometricLoginInProgress
                  ? 'Verificando...'
                  : `Entrar com ${biometricTypeLabel}`}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.containerLine}>
            <View style={styles.line}></View>
            <View style={styles.AjustedTop}>
              <SubTitleComponent 
                subtitle={'ou'} 
                color={'#A3A3A3'} 
                marginTop={0} 
                fontFamily={'Roboto-Medium'} 
                marginRight={0}
              />
            </View>
            <View style={styles.line}></View>
          </View>
          
          <TouchableOpacity 
            onPress={handlePressRemenberPassword} 
            style={styles.RememberPassword}
            activeOpacity={0.7}
          >
            <SubTitleComponent 
              subtitle={'Esqueceu sua senha?'} 
              color={'#A3A3A3'} 
              marginTop={0} 
              fontFamily={'Roboto-Medium'} 
              marginRight={0} 
            />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '100%',
  },
  containerForm: {
    backgroundColor: 'white',
    width: '100%',
    paddingVertical: 10,
    marginTop: 0,
    flex: 1,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  containerImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  rememberMeTextContainer: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  containerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  line: {
    width: 60,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  AjustedTop: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingVertical: 4,
  },
  RememberPassword: {
    alignItems: 'center',
    marginTop: 4,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0087D3',
  },
  biometricButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#0087D3',
  },
  clearCredentialsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 135, 211, 0.08)', // Azul muito clarinho
    borderWidth: 1,
    borderColor: 'rgba(0, 135, 211, 0.15)', // Azul clarinho na borda
    justifyContent: 'center',
    alignItems: 'center',
  },
});