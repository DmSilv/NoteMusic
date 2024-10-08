import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import eyeIcon from '../../../assets/images/eye.png';
import eyeOffIcon from '../../../assets/images/eye-off.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import Input from '../Components/Form/Input/Input';
import MenuBottom from '../Components/Menu-Bottom/MenuBottom';
import EditAccount from '../../../assets/images/Edit-Account.png';
import { StackNavigationProp } from '@react-navigation/stack';
interface ModuleCategoryProps {
    navigation: StackNavigationProp<any>;
}
 const ProfileAccount: React.FC<ModuleCategoryProps> = ({ navigation }) => {
    const scrollViewRef = useRef<ScrollView>(null); 
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Usando um único estado para controlar a visibilidade da senha
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
        scrollViewRef.current?.scrollTo({ y: 10000, animated: true });
      });
  
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });
  
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    const handleUpdateAccount = () => {
        console.log('Atualizar conta');
    };

    // Função para calcular marginTop dinâmico
    const calculateMarginTop = () => {
        if (windowHeight < 600) {
            return 20; // Para telas pequenas
        } else if (windowHeight >= 600 && windowHeight < 800) {
            return 30; // Para telas médias
        } else {
            return 40; // Para telas grandes
        }
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
                <View style={[styles.containerForm, { marginTop: calculateMarginTop(), borderTopLeftRadius: keyboardVisible ? 0 : 40, borderTopRightRadius: keyboardVisible ? 0 : 40 }]}>
                  
                    <View style={styles.containerImage}>
                        <Image source={EditAccount} style={styles.image} />
                    </View>
                    <TitleComponent color={''} fontFamily={''} title={'Gerenciar Conta'} fontSize={''} />
                    <SubTitleComponent subtitle={'Preencha apenas os campos que deseja alterar na sua conta.'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>

                    <SubTitleComponent subtitle={'Nome completo'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <Input onChangeText={''} placeholder={'Danilo Silva'} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }} />

                    <SubTitleComponent subtitle={'E-mail'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <Input onChangeText={''} placeholder={'Danilo@hotmail.com'} secureTextEntry={false} styleWidth={{ width: windowWidth * 0.85 }} />

                    <SubTitleComponent subtitle={'Senha Antiga'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
                        <Input onChangeText={''} placeholder={'Digite sua senha antiga'} secureTextEntry={!showPassword} styleWidth={{ width: '100%' }} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                            <Image source={showPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
                        </TouchableOpacity>
                    </View>

                    <SubTitleComponent subtitle={'Nova Senha'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
                        <Input onChangeText={''} placeholder={'Crie uma nova senha'} secureTextEntry={!showPassword} styleWidth={{ width: '100%' }} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                            <Image source={showPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
                        </TouchableOpacity>
                    </View>

                    <PrimaryButton onPress={handleUpdateAccount} styleWidth={{ width: windowWidth * 0.85 }} title={'Concluir'} />
                </View>
            </ScrollView>

            {!keyboardVisible && (
              <MenuBottom
              navigateToHome={() => navigation.navigate('ProfileHome')}
              navigateToProfile={() => navigation.navigate('ProfileAccount')}
              currentScreen="profile"
          />
          
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    containerForm: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        paddingHorizontal: 24,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 25,
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
    containerImage: {
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 270,
        resizeMode: 'contain',
    },
});

export default ProfileAccount;