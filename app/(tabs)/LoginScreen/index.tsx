import { StyleSheet, View, Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image, Alert, Switch } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import garota_sentada from '../../../assets/images/garota_janela.png';
import eyeIcon from '../../../assets/images/eye.png'; 
import eyeOffIcon from '../../../assets/images/eye-off.png'; 
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle'; 
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import useFormValidation from '../../../hooks/useFormValidation';
import useAsyncOperation from '../../../hooks/useAsyncOperation';
import useErrorHandler from '../../../hooks/useErrorHandler';

export default function LoginScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { login, user, isLoading, isLoginInProgress, loginAttempts, deactivatedAccountDetected, clearDeactivatedFlag } = useAuth();
  
  // Estados para formulário
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
        const savedPassword = await AsyncStorage.getItem('@NoteMusic:savedPassword');
        const autoLoginEnabled = await AsyncStorage.getItem('@NoteMusic:autoLogin');
        
        console.log('🔍 Verificando credenciais salvas...');
        console.log('📝 Credenciais encontradas:', {
          autoLogin: autoLoginEnabled ? '✅ Ativado' : '❌ Desativado',
          email: savedEmail ? '✅ Encontrado' : '❌ Não encontrado',
          password: savedPassword ? '✅ Encontrado' : '❌ Não encontrado'
        });

        if (savedEmail && savedPassword && autoLoginEnabled === 'true') {
          setValue('email', savedEmail);
          setValue('password', savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Erro ao verificar credenciais salvas:', error);
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
      } else {
        Alert.alert('Sucesso!', 'Login realizado com sucesso!');
        navigation.navigate('ProfileHome');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratamento de erro simples
      Alert.alert('Erro', 'Email ou senha incorretos. Tente novamente.');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
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
                width: windowWidth, 
                height: windowHeight * (keyboardVisible ? 0.3 : 0.5) 
              }
            ]} 
          />
        </View>

        <View style={styles.containerForm}>
          <SubTitleComponent 
            subtitle={'Olá, artista!'} 
            color={'#A3A3A3'} 
            fontFamily={'Roboto-Light'} 
            marginRight={24} 
            marginTop={14} 
          />
          <TitleComponent 
            title={'Pronto para dar o play?'} 
            color={''} 
            fontFamily={''} 
            fontSize={24}
            truncate={false}
          />
          <SubTitleComponent 
            subtitle="Prepare-se para uma experiência única de aprendizado e música." 
            color="#A3A3A3" 
            fontFamily="Roboto-Light" 
            marginRight={24} 
            marginTop={12} 
          />

          <SubTitleComponent 
            subtitle={'E-mail'} 
            color={'#A3A3A3'} 
            marginTop={24} 
            fontFamily={''} 
            marginRight={0} 
          />
          <Input 
            onChangeText={(text) => setValue('email', text)}
            placeholder={"Digite seu melhor e-mail"} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }} 
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
            marginTop={16} 
            fontFamily={''} 
            marginRight={0} 
          />
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => setValue('password', text)}
              placeholder={"Digite sua senha"} 
              secureTextEntry={!showPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
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
            styleWidth={{ width: windowWidth * 0.85 }} 
            loading={isLoading}
            disabled={isLoading}
          />
          
          {/* Opção Lembrar-me - Com o botão primeiro e depois o texto */}
          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#D9D9D9', true: '#76B0F1' }}
              thumbColor={rememberMe ? '#0087D3' : '#f4f3f4'}
            />
            <Text style={styles.rememberMeText}>Lembrar-me</Text>
          </View>
          
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
    </SafeAreaView>
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
    marginTop: 16,
    marginBottom: 16,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  containerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
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
    marginTop: 16,
  },
});