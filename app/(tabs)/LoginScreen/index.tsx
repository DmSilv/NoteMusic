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

export default function LoginScreen({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { login } = useAuth();
  
  // Estados para validação
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePressRemenberPassword = () => {
    navigation.navigate('RemenberPassword');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    return isValid;
  };

  const handlePressProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ email, password });
      navigation.navigate('ProfileHome');
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
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
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            placeholder={"Digite seu melhor e-mail"} 
            secureTextEntry={false} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            value={email}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              placeholder={"Digite sua senha"} 
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
