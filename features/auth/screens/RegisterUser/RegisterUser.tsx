import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView, Alert, StatusBar, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import musico from '@/assets/images/musico.png';
import eyeIcon from '@/assets/images/eye.png'; 
import eyeOffIcon from '@/assets/images/eye-off.png'; 
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import Input from '@/shared/components/form/Input/Input';
import { useAuth } from '@/contexts/AuthContext';
import { validateName, validateEmail, validatePassword, validatePasswordConfirmation } from '@/shared/utils/validation';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null); 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { register, isLoading: authIsLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const screenHeight = Dimensions.get('window').height;
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de erro
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'name':
        const nameValidation = validateName(value);
        if (!nameValidation.isValid) {
          error = nameValidation.error || '';
        }
        break;
      case 'email':
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          error = emailValidation.error || '';
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          error = passwordValidation.error || '';
        }
        break;
      case 'confirmPassword':
        const confirmValidation = validatePasswordConfirmation(password, value);
        if (!confirmValidation.isValid) {
          error = confirmValidation.error || '';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = () => {
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);

    return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const handlePressSelectLevel = async () => {
    console.log('🔍 === INÍCIO DO PROCESSO DE REGISTRO ===');
    console.log('📋 Estado atual do formulário:');
    console.log('  - Nome:', name);
    console.log('  - Email:', email);
    console.log('  - Senha:', password ? '***' : 'vazia');
    console.log('  - Confirmar Senha:', confirmPassword ? '***' : 'vazia');
    console.log('  - Erros:', errors);
    
    if (!validateForm()) {
      console.log('❌ Formulário inválido, não prosseguindo');
      console.log('🔍 Erros encontrados:', errors);
      return;
    }

    console.log('✅ Formulário válido, prosseguindo...');
    console.log('🔄 Iniciando processo de registro...');
    
    console.log('🔍 Verificando função register:', typeof register);
    console.log('🔍 Verificando isLoading:', typeof isLoading);
    
    setIsLoading(true);
    console.log('✅ setIsLoading(true) chamado');
    
    try {
      console.log('🌐 Chamando função register do AuthContext...');
      const registerData = { name, email, password };
      console.log('📤 Dados enviados:', registerData);
      
      console.log('⏳ Aguardando resposta da função register...');
      
      // Teste simples para verificar se a função existe
      if (typeof register !== 'function') {
        throw new Error('Função register não é uma função!');
      }
      
      console.log('✅ Função register é válida, chamando...');
      
      // Adicionar timeout para detectar se está travando
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Função register demorou mais de 10 segundos')), 10000);
      });
      
      const registerPromise = register(registerData);
      
      await Promise.race([registerPromise, timeoutPromise]);
      
      console.log('✅ Registro realizado com sucesso!');
      
      // Perguntar se quer salvar as credenciais
      Alert.alert(
        'Conta Criada com Sucesso! 🎉',
        'Deseja salvar suas credenciais para facilitar o login futuro?',
        [
          {
            text: 'Não',
            style: 'cancel',
            onPress: () => {
              console.log('👤 Usuário escolheu não salvar credenciais');
              navigation.navigate('SelectLevelPerson');
            }
          },
          {
            text: 'Sim',
            onPress: async () => {
              console.log('💾 Usuário escolheu salvar credenciais');
              try {
                await AsyncStorage.setItem('@NoteMusic:savedEmail', email);
                await AsyncStorage.setItem('@NoteMusic:savedPassword', password);
                await AsyncStorage.setItem('@NoteMusic:autoLogin', 'true');
                console.log('✅ Credenciais salvas com sucesso');
                Alert.alert(
                  'Perfeito! 🎉', 
                  'Suas credenciais foram salvas com segurança!\n\nNa próxima vez que abrir o app, seus dados já estarão preenchidos automaticamente.',
                  [{ text: 'Entendi!', style: 'default' }]
                );
              } catch (error) {
                console.error('❌ Erro ao salvar credenciais:', error);
                Alert.alert('Aviso', 'Não foi possível salvar suas credenciais, mas sua conta foi criada com sucesso!');
              }
              navigation.navigate('SelectLevelPerson');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem do erro:', error?.message);
      console.error('❌ Stack do erro:', error?.stack);
      
      // Tratamento de erro mais detalhado
      const errorMessage = error?.message || 'Erro desconhecido';
      Alert.alert('Erro no Cadastro', `Não foi possível criar a conta: ${errorMessage}`);
    } finally {
      console.log('🏁 Finalizando processo de registro...');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0087D3' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0087D3" />
      <View style={styles.blueContainer}>
        <View style={styles.whiteContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollViewContent,
                keyboardVisible && { paddingBottom: 150 }
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
                     <View style={styles.containerForm}>
                       
                       <View style={styles.containerImage}>
            <Image 
              source={musico} 
              style={[
                styles.image, 
                { 
                  width: windowWidth * 0.7, 
                  height: windowHeight * (keyboardVisible ? 0.25 : 0.35) 
                }
              ]} 
            />
          </View>

          <SubTitleComponent 
            subtitle={'Olá, futuro músico!'} 
            color={'#A3A3A3'} 
            FontFamily={'Roboto-Light'} 
            MarginRight={24} 
            MarginTop={8} 
          />
          <TitleComponent 
            title={'Vamos criar sua conta?'} 
            color={''} 
            fontFamily={''} 
            truncate={false}
          />
          <SubTitleComponent 
            subtitle="Preencha os dados abaixo para começar sua jornada musical." 
            color="#A3A3A3" 
            FontFamily="Roboto-Light" 
            MarginRight={24} 
            MarginTop={6} 
          />

          <SubTitleComponent 
            subtitle={'Nome'} 
            color={'#A3A3A3'} 
            MarginTop={16} 
            FontFamily={''} 
            MarginRight={0} 
          />
          <Input 
            onChangeText={setName}
            placeholder={"Digite seu primeiro nome"} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            value={name}
            error={errors.name}
            autoCapitalize="words"
            autoCorrect={false}
            onBlur={() => validateField('name', name)}
          />

          <SubTitleComponent 
            subtitle={'E-mail'} 
            color={'#A3A3A3'} 
            MarginTop={16} 
            FontFamily={''} 
            MarginRight={0} 
          />
          <Input 
            onChangeText={setEmail}
            placeholder={"Digite seu melhor e-mail"} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            value={email}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => validateField('email', email)}
          />

          <SubTitleComponent 
            subtitle={'Senha'} 
            color={'#A3A3A3'} 
            MarginTop={16} 
            FontFamily={''} 
            MarginRight={0} 
          />
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={setPassword}
              placeholder={"Digite uma senha segura"} 
              secureTextEntry={!showPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
              value={password}
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => validateField('password', password)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <SubTitleComponent 
            subtitle={'Confirmar Senha'} 
            color={'#A3A3A3'} 
            MarginTop={16} 
            FontFamily={''} 
            MarginRight={0} 
          />
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={setConfirmPassword}
              placeholder={"Digite a senha novamente"} 
              secureTextEntry={!showConfirmPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
              value={confirmPassword}
              error={errors.confirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showConfirmPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <PrimaryButton 
            onPress={handlePressSelectLevel} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            title={'Confirmar e Continuar'}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginBottom: 15 }}
          />

        </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  blueContainer: {
    flex: 1,
    backgroundColor: '#0087D3',
    height: '50%',
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    height: '50%',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
  containerForm: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  containerImage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -28,
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
});