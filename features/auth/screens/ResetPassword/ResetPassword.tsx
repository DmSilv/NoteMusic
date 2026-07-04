import {
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import garota_sentada from '@/assets/images/autenticacao.png';
import eyeIcon from '@/assets/images/eye.png';
import eyeOffIcon from '@/assets/images/eye-off.png';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import Input from '@/shared/components/form/Input/Input';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import apiService from '@/services/api';
import useFormValidation from '@/shared/hooks/useFormValidation';
import useAsyncOperation from '@/shared/hooks/useAsyncOperation';
import { processError } from '@/shared/utils/errorHandler';

interface ResetPasswordProps {
  navigation: any;
  route?: { params?: { email?: string } };
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isLoading, execute } = useAsyncOperation();

  const { formState, errors, setValue, validateField, validateAll } = useFormValidation(
    {
      email: route?.params?.email || '',
      resetCode: '',
      newPassword: '',
      confirmPassword: '',
    },
    {
      email: { required: true, email: true },
      resetCode: {
        required: true,
        custom: (value) => {
          if (!/^\d{6}$/.test(value)) {
            return 'Informe o código de 6 dígitos do e-mail';
          }
          return null;
        },
      },
      newPassword: { required: true, minLength: 6 },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== formState.newPassword.value) {
            return 'Senhas não coincidem';
          }
          return null;
        },
      },
    }
  );

  const handleResetPassword = async () => {
    if (!validateAll() || isLoading) {
      return;
    }

    try {
      await execute(async () => {
        return await apiService.resetPassword({
          email: formState.email.value.trim().toLowerCase(),
          resetCode: formState.resetCode.value.trim(),
          newPassword: formState.newPassword.value,
          confirmPassword: formState.confirmPassword.value,
        });
      });

      Alert.alert(
        'Senha redefinida',
        'Sua senha foi alterada com sucesso. Faça login com a nova senha.',
        [{ text: 'Ir para login', onPress: () => navigation.navigate('LoginScreen') }]
      );
    } catch (error: any) {
      const processed = processError(error);
      Alert.alert(processed.title, processed.message);
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
            <Image
              source={garota_sentada}
              style={[styles.image, { width: windowWidth * 0.9, height: windowHeight * 0.28 }]}
            />
          </View>

          <View
            style={[
              styles.containerForm,
              {
                borderTopLeftRadius: keyboardVisible ? 0 : 40,
                borderTopRightRadius: keyboardVisible ? 0 : 40,
              },
            ]}
          >
            <TitleComponent
              color={''}
              fontFamily={''}
              title={'Redefinir senha'}
              fontSize={24}
              truncate={false}
            />

            <SubTitleComponent
              fontFamily={'Roboto'}
              marginRight={0}
              marginTop={0}
              color={''}
              subtitle={
                'Digite o código de 6 dígitos recebido por e-mail e escolha uma nova senha.'
              }
            />

            <SubTitleComponent
              subtitle={'E-mail'}
              color={'#A3A3A3'}
              marginTop={12}
              fontFamily={''}
              marginRight={0}
            />
            <Input
              onChangeText={(text) => setValue('email', text)}
              value={formState.email.value}
              placeholder={'Seu e-mail'}
              secureTextEntry={false}
              styleWidth={{ width: windowWidth * 0.85 }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => validateField('email')}
            />

            <SubTitleComponent
              subtitle={'Código de verificação'}
              color={'#A3A3A3'}
              marginTop={8}
              fontFamily={''}
              marginRight={0}
            />
            <Input
              onChangeText={(text) => setValue('resetCode', text.replace(/\D/g, '').slice(0, 6))}
              value={formState.resetCode.value}
              placeholder={'000000'}
              secureTextEntry={false}
              styleWidth={{ width: windowWidth * 0.85 }}
              error={errors.resetCode}
              keyboardType="number-pad"
              maxLength={6}
              onBlur={() => validateField('resetCode')}
            />

            <SubTitleComponent
              subtitle={'Nova senha'}
              color={'#A3A3A3'}
              marginTop={8}
              fontFamily={''}
              marginRight={0}
            />
            <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
              <Input
                onChangeText={(text) => setValue('newPassword', text)}
                value={formState.newPassword.value}
                placeholder={'Mínimo 6 caracteres'}
                secureTextEntry={!showNewPassword}
                styleWidth={{ width: windowWidth * 0.85 }}
                error={errors.newPassword}
                autoCapitalize="none"
                onBlur={() => validateField('newPassword')}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIconContainer}
              >
                <Image
                  source={showNewPassword ? eyeIcon : eyeOffIcon}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <SubTitleComponent
              subtitle={'Confirmar nova senha'}
              color={'#A3A3A3'}
              marginTop={8}
              fontFamily={''}
              marginRight={0}
            />
            <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
              <Input
                onChangeText={(text) => setValue('confirmPassword', text)}
                value={formState.confirmPassword.value}
                placeholder={'Repita a nova senha'}
                secureTextEntry={!showConfirmPassword}
                styleWidth={{ width: windowWidth * 0.85 }}
                error={errors.confirmPassword}
                autoCapitalize="none"
                onBlur={() => validateField('confirmPassword')}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIconContainer}
              >
                <Image
                  source={showConfirmPassword ? eyeIcon : eyeOffIcon}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <PrimaryButton
              onPress={handleResetPassword}
              styleWidth={{ width: windowWidth * 0.85 }}
              title={isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              disabled={isLoading}
            />
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
    marginLeft: 24,
    marginRight: 24,
    paddingBottom: 24,
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
    position: 'relative',
    marginBottom: 8,
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
