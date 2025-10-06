import { StyleSheet, View, Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
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

export default function LoginScreen({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { showError, showSuccess } = useErrorHandler();
  
  // Hook para validação de formulário
  const { formState, errors, isValid, setValue, validateField, validateAll } = useFormValidation(
    { email: '', password: '' },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    }
  );
  
  // Hook para operação assíncrona de login
  const { isLoading, execute: executeLogin } = useAsyncOperation();

  const handlePressRemenberPassword = () => {
    navigation.navigate('RemenberPassword');
  };



  const handlePressProfile = async () => {
    if (!validateAll()) {
      return;
    }

    try {
      const loginResult = await executeLogin(async () => {
        return await login({ 
          email: formState.email.value, 
          password: formState.password.value 
        });
      });
      
      // Verificar se é necessário alterar senha temporária
      if (loginResult?.requirePasswordChange) {
        Alert.alert(
          'Senha Temporária Detectada 🔒',
          loginResult.warning || 'Você deve alterar sua senha temporária antes de continuar.',
          [
            {
              text: 'Alterar Senha',
              onPress: () => navigation.navigate('ChangePassword')
            }
          ],
          { cancelable: false }
        );
      } else {
        navigation.navigate('ProfileHome');
      }
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos. Tente novamente.');
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
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
            FontFamily={'Roboto-Light'} 
            MarginRight={24} 
            MarginTop={14} 
          />
          <TitleComponent 
            title={'Pronto para dar o play?'} 
            color={''} 
            fontFamily={''} 
            truncate={false}
          />
          <SubTitleComponent 
            subtitle="Prepare-se para uma experiência única de aprendizado e música." 
            color="#A3A3A3" 
            FontFamily="Roboto-Light" 
            MarginRight={24} 
            MarginTop={12} 
          />

          <SubTitleComponent 
            subtitle={'E-mail'} 
            color={'#A3A3A3'} 
            MarginTop={24} 
            FontFamily={''} 
            MarginRight={0} 
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
            MarginTop={16} 
            FontFamily={''} 
            MarginRight={0} 
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

          <View style={styles.containerLine}>
            <View style={styles.line}></View>
            <View style={styles.AjustedTop}>
              <SubTitleComponent 
                subtitle={'ou'} 
                color={'#A3A3A3'} 
                MarginTop={0} 
                FontFamily={'Roboto-Medium'} 
                MarginRight={0}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handlePressRemenberPassword} 
            style={styles.RememberPassword}
            activeOpacity={0.7}
          >
            <SubTitleComponent 
              subtitle={'Esqueceu sua senha?'} 
              color={'#A3A3A3'} 
              MarginTop={0} 
              FontFamily={'Roboto-Medium'} 
              MarginRight={0} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  AjustedTop: {
    backgroundColor: 'white',
    padding: 0,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 2,
    position: 'absolute',
    alignSelf: 'center'
  },
  containerLine: {
    height: 0,
    marginBottom: 28,
  },
  line: {
    width: '90%',
    height: 2,
    backgroundColor: '#EDEDED',
    marginVertical: 20,
    alignSelf: 'center'
  },
  RememberPassword: {
    width: 'auto',
    alignSelf: 'center',
    paddingVertical: 8,
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    resizeMode: 'contain',
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
  }
});
