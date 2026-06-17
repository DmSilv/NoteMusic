import React from 'react';
import { StyleSheet, View, Image, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native';
import garota_sentada from '@/assets/images/garota_sentada.png';
import LogoName from '@/assets/images/LogoName.png';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitle from '@/shared/components/form/SubTitle/SubTitle';
import TertiaryButton from '@/shared/components/form/TertiaryButton/TertiaryButton';
import SecondaryButton from '@/shared/components/form/SecondaryButton/SecondaryButton';
import { NavigationProp } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function ShowAccountSelectionScreen({ navigation }: Props) {

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const handlePressLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handlePressRegister = () => {
    navigation.navigate('RegisterUser');
  };

  const getMarginBottom = (height: number): number => (height <= 720 ? height * 0.35 : height * 0.25);

  const heightLogo = (height: number): number => (height <= 720 ? height * 0.25 : height * 0.2); // Retornar número

  const imageHeight = (height: number): number => (height <= 720 ? height * 0.4 : height * 0.2); // Retornar número



  const shouldDisplayImage = (height: number) => height > 720;

  const getFormContainerMarginBottom = (height: number): string => (height <= 720 ? '50%' : '0%');

  const imageWidth = windowWidth * 1.2;
  const containerModelHeight = 320; // Aumentado para dar mais espaço
  const marginBottom = getMarginBottom(windowHeight);
  const heightLogoImage = heightLogo(windowHeight);
  const formContainerMarginBottom = getFormContainerMarginBottom(windowHeight);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.body}>
        <View style={[styles.containerImage, { height: windowHeight - containerModelHeight - marginBottom, marginBottom }]}>
          <Image source={LogoName} style={[styles.imagelogo, { height: heightLogoImage }]} />
          {shouldDisplayImage(windowHeight) && (
            <Image source={garota_sentada} style={[styles.image, { width: imageWidth, height: '100%' }]} />
          )}
        </View>

        <View style={[styles.containerModel, { height: containerModelHeight }]}>
          <View style={styles.containerTitle}>
            <TitleComponent title="Bem-vindo ao NoteMusic" color="white" fontFamily="Roboto-Bold" fontSize={''} truncate={false} />
          </View>
          <SubTitle
            subtitle="Prepare-se para uma experiência musical envolvente Explore os segredos da teoria musical e aperfeiçoe suas habilidades."
            color="white"
            marginTop={4}
            fontFamily="Roboto-Light"
            marginRight={0}
          />

          <SubTitle
            subtitle="Escolha uma das opções abaixo para dar o primeiro passo na sua jornada."
            color="white"
            marginTop={32}
            fontFamily="Roboto-Light"
            marginRight={0}
          />

          <View style={styles.buttonContainer}>
            <TertiaryButton title="Criar Conta" onPress={handlePressRegister} stylewidht={{ width: windowWidth * 0.4 }} />
            <SecondaryButton title="Já possui conta" onPress={handlePressLogin} styleWidth={{ width: windowWidth * 0.4 }} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imagelogo: {
    width: '90%',
  },
  image: {
    resizeMode: 'contain',
  },
  containerModel: {
    backgroundColor: '#1281BF',
    width: '100%',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: '5%',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
  },containerTitle:{
    alignSelf:'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 35,
    marginBottom: 35,
    width: '100%',
  },

});
