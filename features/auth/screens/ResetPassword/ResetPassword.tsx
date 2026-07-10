import {
  StyleSheet,
  View,
  Text,
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
import clockIcon from '@/assets/images/clock.png';
import TitleComponent from '@/shared/components/form/Title/Title';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import Input from '@/shared/components/form/Input/Input';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import apiService from '@/services/api';
import useFormValidation from '@/shared/hooks/useFormValidation';
import useAsyncOperation from '@/shared/hooks/useAsyncOperation';
import { processError } from '@/shared/utils/errorHandler';
import { validateEmail } from '@/shared/utils/validation';

interface ResetPasswordProps {
  navigation: any;
  route?: { params?: { email?: string } };
}

// Evita reenvios em sequência (o backend já limita a 5/hora, isso aqui é só
// para não deixar o usuário martelar o botão sem perceber que já enviou).
const RESEND_COOLDOWN_SECONDS = 60;

function formatCooldown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isLoading, execute } = useAsyncOperation();
  // Mesma fórmula usada no Input (Style.js) para a altura do campo. Precisamos
  // desse valor aqui para alinhar os elementos sobrepostos (olho/reenviar) só
  // com a altura do input, e não com a altura total do wrapper — que cresce
  // quando a mensagem de erro aparece abaixo do campo.
  const inputFieldHeight = Math.max(48, windowHeight * 0.06);

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

  const handleResendCode = async () => {
    if (isResending || resendCooldown > 0) {
      return;
    }

    const email = formState.email.value.trim().toLowerCase();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      validateField('email');
      Alert.alert('E-mail inválido', 'Confirme o e-mail acima antes de reenviar o código.');
      return;
    }

    setIsResending(true);
    try {
      const response = await apiService.forgotPassword(email);
      Alert.alert(
        'Código reenviado',
        response.message ||
          'Se este e-mail estiver cadastrado, enviaremos um novo código para redefinir sua senha.'
      );
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: any) {
      const processed = processError(error);
      Alert.alert(processed.title, processed.message);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

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
            <View style={[styles.resendCodeContainer, { width: windowWidth * 0.85 }]}>
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

              {resendCooldown > 0 ? (
                <View style={[styles.resendInsideButton, { height: inputFieldHeight }]}>
                  <Image source={clockIcon} style={styles.resendClockIcon} />
                  <Text style={styles.resendInsideCountdownText}>
                    {formatCooldown(resendCooldown)}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={isResending}
                  activeOpacity={0.7}
                  style={[styles.resendInsideButton, { height: inputFieldHeight }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.resendInsideButtonText} numberOfLines={1}>
                    {isResending ? 'Enviando...' : 'Reenviar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

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
                style={[styles.eyeIconContainer, { height: inputFieldHeight }]}
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
                style={[styles.eyeIconContainer, { height: inputFieldHeight }]}
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
  resendCodeContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  resendInsideButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  resendInsideButtonText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#0087D3',
  },
  resendInsideCountdownText: {
    fontSize: 13,
    fontFamily: 'Roboto',
    color: '#A3A3A3',
  },
  resendClockIcon: {
    width: 13,
    height: 13,
    marginRight: 4,
    tintColor: '#A3A3A3',
    resizeMode: 'contain',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
});
