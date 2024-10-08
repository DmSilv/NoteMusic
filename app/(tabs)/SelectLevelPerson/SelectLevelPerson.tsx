import { StyleSheet, View, Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import select_level from '../../../assets/images/select_level.png';
import PickerComponent from '../Components/Form/Picker/Picker';
import { NavigationProp } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}
export default function SelectLevelPerson({ navigation }: Props) {
  const scrollViewRef = useRef<ScrollView>(null); // Referência para o ScrollView
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('Aprendiz (Iniciante)');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollViewRef.current?.scrollTo({ y: 500, animated: true }); // Ajuste a rolagem conforme necessário
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const categories = [
    { label: 'Aprendiz (Iniciante)', value: 'Aprendiz (Iniciante)' },
    { label: 'Virtuoso (Intermediário)', value: 'Virtuoso (Intermediário)' },
    { label: 'Maestro (Avançado)', value: 'Maestro (Avançado)' },
  ];

  const handlePressProfile = () => {
    navigation.navigate('ProfileHome');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Ajuste de deslocamento para iOS
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
            <Image source={select_level} style={styles.image} />
          </View>

          <View>
            <Text style={styles.Title}>Qual é o Seu Nível Musical?</Text>
            <Text style={styles.SubTitle}>Diga-nos onde você se encontra no seu caminho musical. Escolha o nível que melhor reflete suas habilidades e experiência!</Text>
            <PickerComponent
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              items={categories}
            />
          </View>
          <TouchableOpacity onPress={handlePressProfile} style={[styles.button, styles.primaryButton, { width: windowWidth * 0.85 }]}>
            <Text style={styles.buttonText}>Confirmar e Concluir</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Title: {
    color: '#0087D3',
    fontSize: 24,
    fontFamily: 'Roboto',
    marginTop: 4,
  },
  SubTitle: {
    color: '#A3A3A3',
    fontSize: 13,
    fontFamily: 'Roboto-Light',
    marginTop: 4,
  },
  picker: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#F1F1F1',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#A3A3A3',
    marginTop: 16,
  },
  button: {
    height: 53,
    borderRadius: 100,
    justifyContent: 'center',
    marginTop: 100,
  },
  primaryButton: {
    backgroundColor: '#0A8CD6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginBottom: 25,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  image: {
    width: '100%',
    height: 270,
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '50%',
    marginBottom: '20%',
  },
});
