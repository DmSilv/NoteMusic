import { StyleSheet, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { appAlert } from '@/shared/utils/appAlert';
import React, { useState, useEffect, useRef } from 'react';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import garota_sentada from '@/assets/images/autenticacao.png';
import eyeIcon from '@/assets/images/eye.png'; 
import eyeOffIcon from '@/assets/images/eye-off.png'; 
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import Input from '@/shared/components/form/Input/Input';
import LabelComponent from '@/shared/components/form/Label/label';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import useFormValidation from '@/shared/hooks/useFormValidation';
import useAsyncOperation from '@/shared/hooks/useAsyncOperation';

interface ChangePasswordProps {
  navigation: any;
  route?: any;
}

export default function ChangePasswordScreen({ navigation, route }: ChangePasswordProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { changeTempPassword, user } = useAuth();
  
  // Obter senha temporária dos parâmetros de navegação
  const tempPassword = route?.params?.tempPassword;
  
  // Hook para validação de formulário
  const { formState, errors, setValue, validateField, validateAll } = useFormValidation(
    { currentPassword: tempPassword || '', newPassword: '', confirmPassword: '' },
    {
      currentPassword: { required: true },
      newPassword: { required: true, minLength: 6 },
      confirmPassword: { 
        required: true, 
        custom: (value) => {
          if (value !== formState.newPassword.value) {
            return 'Senhas não coincidem';
          }
          return null;
        }
      }
    }
  );
  
  // Hook para operação assíncrona
  const { isLoading, execute: executeChangePassword } = useAsyncOperation();



  const handleChangePassword = async () => {
    if (!validateAll()) {
      return;
    }

    try {
      await executeChangePassword(async () => {
        return await changeTempPassword(formState.currentPassword.value, formState.newPassword.value);
      });
      
      appAlert(
        'Senha Alterada com Sucesso! ✅',
        'Sua nova senha foi definida com segurança. Agora você pode acessar todas as funcionalidades do app.',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('ProfileHome')
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      appAlert(
        'Erro',
        error.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.'
      );
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
          <Image source={garota_sentada} style={[styles.image, { width: windowWidth * 0.9, height: windowHeight * 0.3 }]} />
        </View>

        <View style={[styles.containerForm, { borderTopLeftRadius: keyboardVisible ? 0 : 40, borderTopRightRadius: keyboardVisible ? 0 : 40 }]}>
          
          <TitleComponent color={''} fontFamily={''} title={'Alterar Senha Temporária'} truncate={false}></TitleComponent>
          
          <SubTitleComponent 
            FontFamily={'Roboto'} 
            MarginRight={0} 
            MarginTop={0} 
            color={''} 
            subtitle={`Olá, ${user?.name || 'usuário'}! Para sua segurança, é necessário alterar a senha temporária por uma nova senha de sua escolha.`}
          />

          <LabelComponent text={'Senha Atual (Temporária)'}></LabelComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => setValue('currentPassword', text)}
              value={formState.currentPassword.value}
              placeholder={'Digite a senha temporária'} 
              secureTextEntry={!showCurrentPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
              error={errors.currentPassword}
              onBlur={() => validateField('currentPassword')}
            />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showCurrentPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <LabelComponent text={'Nova Senha'}></LabelComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => setValue('newPassword', text)}
              value={formState.newPassword.value}
              placeholder={'Digite sua nova senha'} 
              secureTextEntry={!showNewPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
              error={errors.newPassword}
              onBlur={() => validateField('newPassword')}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showNewPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <LabelComponent text={'Confirmar Nova Senha'}></LabelComponent>
          <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
            <Input 
              onChangeText={(text) => setValue('confirmPassword', text)}
              value={formState.confirmPassword.value}
              placeholder={'Confirme sua nova senha'} 
              secureTextEntry={!showConfirmPassword} 
              styleWidth={{ width: windowWidth * 0.85 }} 
              error={errors.confirmPassword}
              onBlur={() => validateField('confirmPassword')}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showConfirmPassword ? eyeIcon : eyeOffIcon}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <PrimaryButton 
            onPress={handleChangePassword} 
            styleWidth={{ width: windowWidth * 0.85 }} 
            title={isLoading ? 'Alterando...' : 'Alterar Senha'}
            disabled={isLoading}
          />

          <View style={styles.securityNote}>
            <TitleComponent 
              color={'#666'} 
              fontFamily={'Roboto'} 
              title={'🔒 Dica de Segurança:'}
            />
            <SubTitleComponent 
              FontFamily={'Roboto'} 
              MarginRight={0} 
              MarginTop={5} 
              color={'#666'} 
              subtitle={'Use uma senha forte com pelo menos 6 caracteres, incluindo letras, números e símbolos.'}
            />
          </View>
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
    paddingBottom: 30,
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
  securityNote: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
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
