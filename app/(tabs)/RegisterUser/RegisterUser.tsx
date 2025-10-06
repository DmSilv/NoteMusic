import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { ShowAccountSelectionScreenNavigationProp } from './types';
import musico from '../../../assets/images/musico.png';
import eyeIcon from '../../../assets/images/eye.png'; 
import eyeOffIcon from '../../../assets/images/eye-off.png'; 
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { validateName, validateEmail, validatePassword, validatePasswordConfirmation } from '../../utils/validation';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null); 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { register } = useAuth();

  // Estados para formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para validação
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Função para validar nome
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return false;
    }
    if (name.length < 2) {
      setNameError('Nome deve ter no mínimo 2 caracteres');
      return false;
    }
    if (name.length > 15) {
      setNameError('Nome deve ter no máximo 15 caracteres (apenas primeiro nome)');
      return false;
    }
    setNameError('');
    return true;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validar nome usando a função específica
    if (!validateName(name)) {
      isValid = false;
    }

    // Validar email
    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('E-mail inválido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar senha
    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validar confirmação de senha
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirmação de senha é obrigatória');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Senhas não coincidem');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handlePressSelectLevel = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await register({ name, email, password });
      navigation.navigate('SelectLevelPerson');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a conta. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <Image source={musico} style={styles.image} />
          </View>

          <TitleComponent color={''} fontFamily={''} title={'Vamos criar sua conta'} fontSize={''} truncate={false}></TitleComponent>

          <SubTitleComponent fontFamily={''} marginRight={''} marginTop={''} color={''} subtitle={'Preencha seus dados e prepare-se para uma incrível aventura musical!'}></SubTitleComponent>

          <SubTitleComponent subtitle={'Nome completo'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <Input 
            onChangeText={(text) => {
              // Limitar a 15 caracteres (apenas primeiro nome)
              if (text.length > 15) {
                return; // Não permitir mais de 15 caracteres
              }
              
              setName(text);
              // Validar em tempo real
              if (text.length > 0) {
                validateName(text);
              } else {
                setNameError('');
              }
            }}
            onBlur={() => validateName(name)}
            placeholder={'Seu primeiro nome'} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }}
            value={name}
            error={nameError}
            autoCapitalize="words"
            maxLength={15}
          />

          <SubTitleComponent subtitle={'E-mail'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <Input 
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            placeholder={'Digite seu melhor e-mail'} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }}
            value={email}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <SubTitleComponent subtitle={'Senha'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              placeholder={'Crie uma senha'} 
              secureTextEntry={!showPassword} 
              styleWidth={{ width: windowWidth * 0.85 }}
              value={password}
              error={passwordError}
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

          <SubTitleComponent subtitle={'Confirmar Senha'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              placeholder={'Digite sua senha novamente'} 
              secureTextEntry={!showConfirmPassword} 
              styleWidth={{ width: windowWidth * 0.85 }}
              value={confirmPassword}
              error={confirmPasswordError}
              autoCapitalize="none"
              autoCorrect={false}
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
  containerForm: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    paddingHorizontal: 24
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '15%',
  },
  image: {
    width: '100%',
    height: 270,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
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
});
