import { StyleSheet, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import garota_sentada from '../../../assets/images/autenticacao.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import Input from '../Components/Form/Input/Input';
import LabelComponent from '../Components/Form/Label/label';
import ButtonComponent from '../Components/Form/Button/PrimaryButton/PrimaryButton';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const handlePressRemenberPassword = () => {
    navigation.navigate('LoginScreen');
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
          
          <TitleComponent color={''} fontFamily={''} title={'Esqueceu sua Senha?'}></TitleComponent>
          
          <SubTitleComponent FontFamily={'Roboto'} MarginRight={0} MarginTop={0} color={''} subtitle={'Não se preocupe! Insira seu e-mail abaixo e enviaremos as instruções para redefinir sua senha. Você logo estará de volta à sua jornada musical!'}></SubTitleComponent>

          <LabelComponent text={'E-mail'}></LabelComponent>
          <Input onChangeText={''} placeholder={'Digite seu e-mail'} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }} ></Input>

          <ButtonComponent onPress={''} styleWidth={{ width: windowWidth * 0.85 }} title={'Solicitar Redefinição'}></ButtonComponent>
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
