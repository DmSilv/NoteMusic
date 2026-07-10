import {
  StyleSheet,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import garota_sentada from '@/assets/images/autenticacao.png';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import Input from '@/shared/components/form/Input/Input';
import ButtonComponent from '@/shared/components/form/PrimaryButton/PrimaryButton';
import apiService from '@/services/api';
import { validateEmail } from '@/shared/utils/validation';
import { processError } from '@/shared/utils/errorHandler';

export default function ForgotPasswordScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'E-mail inválido');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateForm() || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.forgotPassword(email);

      // Único botão, propositalmente: o objetivo é levar o usuário direto para
      // digitar o código recebido, não dar a opção de "escapar" de volta pro
      // login (o que não fazia sentido nesse ponto do fluxo de recuperação).
      Alert.alert(
        'Verifique seu e-mail',
        response.message ||
          'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.',
        [
          {
            text: 'Inserir código',
            onPress: () =>
              navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() }),
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      const processed = processError(error);
      Alert.alert(processed.title, processed.message);
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
        >
          <View style={styles.containerImage}>
            <Image
              source={garota_sentada}
              style={[styles.image, { width: windowWidth * 0.9, height: windowHeight * 0.4 }]}
            />
          </View>

          <View
            style={[
              styles.containerForm,
              {
                borderTopLeftRadius: keyboardVisible ? 0 : 40,
                borderTopRightRadius: keyboardVisible ? 0 : 40,
              },
            ]}
          >
            <TitleComponent
              color={''}
              fontFamily={''}
              title={'Esqueceu sua senha?'}
              fontSize={24}
              truncate={false}
            />

            <SubTitleComponent
              fontFamily={'Roboto'}
              marginRight={0}
              marginTop={0}
              color={''}
              subtitle={
                'Informe seu e-mail. Se estiver cadastrado, enviaremos um código para redefinir sua senha com segurança.'
              }
            />

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
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ButtonComponent
              onPress={handleSendResetEmail}
              styleWidth={{ width: windowWidth * 0.85 }}
              title={isLoading ? 'Enviando...' : 'Enviar instruções'}
              disabled={isLoading}
            />
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
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerForm: {
    backgroundColor: 'white',
    width: '90%',
    marginTop: 0,
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
