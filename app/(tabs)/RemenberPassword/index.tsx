import { StyleSheet, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import garota_sentada from '../../../assets/images/autenticacao.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import Input from '../Components/Form/Input/Input';
import LabelComponent from '../Components/Form/Label/label';
import ButtonComponent from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import apiService from '../../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  // Estados para o formulário
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
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

    return isValid;
  };

  const handleSendResetEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.request('/auth/forgotpassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      Alert.alert(
        'Email Enviado! 📧',
        'Uma senha temporária foi enviada para seu e-mail. Verifique sua caixa de entrada (e spam) e use-a para fazer login.',
        [
          {
            text: 'Ir para Login',
            onPress: () => navigation.navigate('LoginScreen')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      Alert.alert(
        'Erro',
        error.message || 'Erro ao enviar email. Verifique o endereço e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollViewRef.current?.scrollTo({ y: 400, animated: true });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.containerImage}>
          <Image source={garota_sentada} style={[styles.image, { width: windowWidth * 0.9, height: windowHeight * 0.4 }]} />
        </View>

        <View style={[styles.containerForm, { borderTopLeftRadius: keyboardVisible ? 0 : 40, borderTopRightRadius: keyboardVisible ? 0 : 40 }]}>
          
          <TitleComponent color={''} fontFamily={''} title={'Esqueceu sua Senha?'} truncate={false}></TitleComponent>
          
          <SubTitleComponent FontFamily={'Roboto'} MarginRight={0} MarginTop={0} color={''} subtitle={'Não se preocupe! Insira seu e-mail abaixo e enviaremos as instruções para redefinir sua senha. Você logo estará de volta à sua jornada musical!'}></SubTitleComponent>

          <LabelComponent text={'E-mail'}></LabelComponent>
          <Input 
            onChangeText={setEmail} 
            value={email}
            placeholder={'Digite seu e-mail'} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            error={emailError}
          />

          <ButtonComponent 
            onPress={handleSendResetEmail} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            title={isLoading ? 'Enviando...' : 'Solicitar Redefinição'}
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
    backgroundColor: 'white',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerForm: {
    backgroundColor: 'white',
    width: '90%',
    marginTop: -20,
    marginLeft: 24,
    marginRight: 24,
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  image: {
    resizeMode: 'contain',
  },
});
