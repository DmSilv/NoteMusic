import { StyleSheet, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image, Alert, Linking, StatusBar } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import garota_sentada from '../../../assets/images/autenticacao.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import Input from '../Components/Form/Input/Input';
import LabelComponent from '../Components/Form/Label/label';
import ButtonComponent from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import apiService from '../../../services/api';
import { validateEmail } from '../../../utils/validation';

export default function ForgotPasswordScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  // Estados para o formulário
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  // ✅ Removido - usando validateEmail do utils/validation.ts

  const validateForm = () => {
    let isValid = true;
    
    // ✅ Validar email com verificação de domínio
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'E-mail inválido');
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
      const response = await apiService.forgotPassword(email);

      Alert.alert('Sucesso!', 'Email de recuperação enviado!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('LoginScreen')
        }
      ]);
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      
      // Tratamento de erro simples
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação. Tente novamente.');
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
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0087D3" 
        translucent={false}
        animated={true}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0087D3' }}>
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
          
          <TitleComponent color={''} fontFamily={''} title={'Esqueceu sua Senha?'} fontSize={24} truncate={false}></TitleComponent>
          
          <SubTitleComponent fontFamily={'Roboto'} marginRight={0} marginTop={0} color={''} subtitle={'Não se preocupe! Insira seu e-mail abaixo e enviaremos as instruções para redefinir sua senha. Você logo estará de volta à sua jornada musical!'}></SubTitleComponent>

          <SubTitleComponent 
            subtitle={'E-mail'} 
            color={'#A3A3A3'} 
            marginTop={12} 
            fontFamily={''} 
            marginRight={0} 
          />
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
    </SafeAreaView>
    </>
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
