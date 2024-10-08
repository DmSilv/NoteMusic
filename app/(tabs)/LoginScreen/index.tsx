import { StyleSheet, View, Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import garota_sentada from '../../../assets/images/garota_janela.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle'; 
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';

export default function RegisterUser({ navigation }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const handlePressRemenberPassword = () => {
    navigation.navigate('RemenberPassword');
  };

  const handlePressProfile = () => {
    navigation.navigate('ProfileHome');
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
          <Image source={garota_sentada} style={[styles.image, { width: windowWidth, height: windowHeight * 0.5 }]} />
        </View>

        <View style={styles.containerForm}>
          <SubTitleComponent subtitle={'Olá, artista!'} color={'#A3A3A3'} FontFamily={'Roboto-Light'} MarginRight={24} MarginTop={14} />
          <TitleComponent title={'Pronto para dar o play?'} color={''} fontFamily={''} />
          <SubTitleComponent subtitle="Prepare-se para uma experiência única de aprendizado e música." color="#A3A3A3" FontFamily="Roboto-Light" MarginRight={24} MarginTop={12} />

          <SubTitleComponent subtitle={'E-mail'} color={'#A3A3A3'} MarginTop={12} FontFamily={''} MarginRight={0} />
          <Input onChangeText={() => { }} placeholder={"Digite seu melhor e-mail"} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }} />

          <SubTitleComponent subtitle={'Senha'} color={'#A3A3A3'} MarginTop={12} FontFamily={''} MarginRight={0} />
          <Input onChangeText={() => { }} placeholder={"Digite sua senha"} secureTextEntry={true} styleWidth={{ width: windowWidth * 0.85 }} />

          <PrimaryButton onPress={handlePressProfile} title={'Acessar'} styleWidth={{ width: windowWidth * 0.85 }} />

          <View style={styles.containerLine}>
            <View style={styles.line}></View>
            <View style={styles.AjustedTop}>
              <SubTitleComponent subtitle={'ou'} color={'#A3A3A3'} MarginTop={0} FontFamily={'Roboto-Medium'} MarginRight={0}/>
            </View>
          </View>
          <TouchableOpacity onPress={handlePressRemenberPassword} style={styles.RememberPassword}>
            <SubTitleComponent subtitle={'Esqueceu sua senha?'} color={'#A3A3A3'} MarginTop={0} FontFamily={'Roboto-Medium'} MarginRight={0} />
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
    alignSelf:'center'
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
    alignSelf:'center'
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
    alignSelf:'center'
  },
  RememberPassword: {
    width: 'auto',
    alignSelf:'center'
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    resizeMode: 'contain',
  },
});
