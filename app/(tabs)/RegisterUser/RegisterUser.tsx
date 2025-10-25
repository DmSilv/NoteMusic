import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShowAccountSelectionScreenNavigationProp } from './types';
import musico from '../../../assets/images/musico.png';
import eyeIcon from '../../../assets/images/eye.png'; 
import eyeOffIcon from '../../../assets/images/eye-off.png'; 
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { validateName, validateEmail, validatePassword, validatePasswordConfirmation } from '../../../utils/validation';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null); 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { register, isLoading } = useAuth();
  
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
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await register({ name, email, password });
      
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
      navigation.navigate('SelectLevelPerson');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento de erro simples
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.containerForm,
            { borderTopLeftRadius: keyboardVisible ? 0 : 40, borderTopRightRadius: keyboardVisible ? 0 : 40 }
          ]}
        >
          <View style={styles.containerImage}>
            <Image 
              source={musico} 
              style={[
                styles.image, 
                { 
                  width: windowWidth * 0.6, 
                  height: windowHeight * (keyboardVisible ? 0.2 : 0.3) 
                }
              ]} 
            />
          </View>

          <SubTitleComponent 
            subtitle={'Olá, futuro músico!'} 
            color={'#A3A3A3'} 
            FontFamily={'Roboto-Light'} 
            MarginRight={24} 
            MarginTop={14} 
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
            MarginTop={12} 
          />

          <SubTitleComponent 
            subtitle={'Nome'} 
            color={'#A3A3A3'} 
            MarginTop={24} 
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
          />

        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
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
    paddingVertical: 20,
    marginTop: -50,
  },
  containerImage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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