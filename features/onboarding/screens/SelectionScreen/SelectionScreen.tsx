import React, { useCallback } from 'react';
import { Platform, StyleSheet, View, Image, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import LevelTopBar from '@/shared/components/layout/LevelTopBar';
import garota_sentada from '@/assets/images/garota_sentada.png';
import LogoName from '@/assets/images/LogoName.png';
import { getLogoNameHeight, logoNameImageStyles } from '@/shared/constants/logoNameLayout';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitle from '@/shared/components/form/SubTitle/SubTitle';
import TertiaryButton from '@/shared/components/form/TertiaryButton/TertiaryButton';
import SecondaryButton from '@/shared/components/form/SecondaryButton/SecondaryButton';
import { NavigationProp } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

const WELCOME_ANDROID_NAV_BAR = '#FFFFFF';

/** Espaçamentos proporcionais à altura da tela: mesma aparência em qualquer aparelho, sem depender de scroll. */
function getHeroModalGap(height: number): number {
  return Math.max(16, height * 0.035);
}

function getSecondSubtitleGap(height: number): number {
  return Math.max(16, height * 0.035);
}

function getButtonRowSpacing(height: number): number {
  return Math.max(16, height * 0.04);
}

export default function ShowAccountSelectionScreen({ navigation }: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }

      (async () => {
        try {
          // Edge-to-edge: setStyle evita scrim laranja; não usar setBackgroundColorAsync aqui
          NavigationBar.setStyle('light');
          await NavigationBar.setButtonStyleAsync('dark');
        } catch {
          try {
            await NavigationBar.setBackgroundColorAsync(WELCOME_ANDROID_NAV_BAR);
            await NavigationBar.setButtonStyleAsync('dark');
          } catch {
            // ignore
          }
        }
      })();

      return () => {
        (async () => {
          try {
            NavigationBar.setStyle('auto');
            await NavigationBar.setButtonStyleAsync('dark');
            await NavigationBar.setBackgroundColorAsync(WELCOME_ANDROID_NAV_BAR);
          } catch {
            try {
              NavigationBar.setStyle('auto');
            } catch {
              // ignore
            }
          }
        })();
      };
    }, [])
  );

  const handlePressLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handlePressRegister = () => {
    // TODO(teste-temporario): redirecionamento direto para as telas de
    // apresentação do app (AppIntroScreen), pulando o formulário de
    // cadastro, apenas para facilitar os testes dessa nova sequência.
    // Restaurar para navigation.navigate('RegisterUser') quando os testes
    // terminarem — o formulário original não foi removido.
    navigation.navigate('AppIntroScreen');
  };

  const heightLogoImage = getLogoNameHeight(windowHeight);
  const shouldDisplayImage = (height: number) => height > 720;
  const imageWidth = windowWidth * 1.1;
  const illustrationMaxHeight = windowHeight * 0.3;
  const heroModalGap = getHeroModalGap(windowHeight);
  const secondSubtitleGap = getSecondSubtitleGap(windowHeight);
  const buttonRowSpacing = getButtonRowSpacing(windowHeight);

  return (
    <View style={styles.root}>
      <LevelTopBar />
      <View style={styles.body}>
        <View style={[styles.heroSection, { paddingBottom: heroModalGap }]}>
          <Image source={LogoName} style={[logoNameImageStyles.image, { height: heightLogoImage }]} />
          {shouldDisplayImage(windowHeight) && (
            <Image
              source={garota_sentada}
              style={[
                styles.image,
                {
                  width: imageWidth,
                  maxHeight: illustrationMaxHeight,
                  marginTop: 12,
                },
              ]}
            />
          )}
        </View>

        <View style={styles.modalSection}>
          <View style={styles.containerModel}>
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
            marginTop={secondSubtitleGap}
            fontFamily="Roboto-Light"
            marginRight={0}
          />

          <View style={[styles.buttonContainer, { marginTop: buttonRowSpacing, marginBottom: buttonRowSpacing }]}>
            <TertiaryButton title="Criar Conta" onPress={handlePressRegister} stylewidht={{ width: windowWidth * 0.4 }} />
            <SecondaryButton title="Já possui conta" onPress={handlePressLogin} styleWidth={{ width: windowWidth * 0.4 }} />
          </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },
  image: {
    resizeMode: 'contain',
  },
  modalSection: {
    backgroundColor: '#1281BF',
  },
  containerModel: {
    backgroundColor: '#1281BF',
    width: '100%',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: '5%',
    paddingVertical: 20,
  },
  containerTitle: {
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
