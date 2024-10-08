import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { ShowAccountSelectionScreenNavigationProp } from './types';
import musico from '../../../assets/images/musico.png';
import eyeIcon from '../../../assets/images/eye.png'; 
import eyeOffIcon from '../../../assets/images/eye-off.png'; 
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null); 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado separado para confirmar senha
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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

  const handlePressSelectLevel = () => {
    navigation.navigate('SelectLevelPerson');
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

          <TitleComponent color={''} fontFamily={''} title={'Vamos criar sua conta'} fontSize={''}></TitleComponent>

          <SubTitleComponent fontFamily={''} marginRight={''} marginTop={''} color={''} subtitle={'Preencha seus dados e prepare-se para uma incrível aventura musical!'}></SubTitleComponent>

          <SubTitleComponent subtitle={'Nome completo'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <Input onChangeText={''} placeholder={'Digite seu nome completo'} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }}></Input>

          <SubTitleComponent subtitle={'E-mail'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <Input onChangeText={''} placeholder={'Digite seu melhor e-mail'} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }}></Input>

          <SubTitleComponent subtitle={'Senha'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input onChangeText={''} placeholder={'Crie uma senha'} secureTextEntry={!showPassword} styleWidth={{ width: windowWidth * 0.85 }}></Input>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <SubTitleComponent subtitle={'Confirmar Senha'} fontFamily={''} marginRight={''} marginTop={''} color={''}></SubTitleComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input onChangeText={''} placeholder={'Digite sua senha novamente'} secureTextEntry={!showConfirmPassword} styleWidth={{ width: windowWidth * 0.85 }}></Input>
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}> 
              <Image
                source={showConfirmPassword ? eyeIcon : eyeOffIcon} // Controle separado para o campo de confirmação
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <PrimaryButton onPress={handlePressSelectLevel} styleWidth={{ width: windowWidth * 0.85 }} title={'Confirmar e Continuar'}></PrimaryButton>

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
