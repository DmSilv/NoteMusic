import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves do SecureStore só podem ter letras, números, '.', '-' e '_' — por
// isso não seguem o padrão "@NoteMusic:algo" usado no AsyncStorage.
const SECURE_TOKEN_KEY = 'notemusic_biometric_token';
const BIOMETRIC_ENABLED_FLAG = '@NoteMusic:biometricEnabled';

function devLog(...args: unknown[]) {
  if (__DEV__) {
    console.log(...args);
  }
}

/** Verifica se o aparelho tem sensor de biometria e algo cadastrado no sistema. */
export async function isBiometricHardwareAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    return await LocalAuthentication.isEnrolledAsync();
  } catch (error) {
    devLog('Erro ao verificar hardware de biometria:', error);
    return false;
  }
}

/** Nome amigável do tipo de biometria disponível, para exibir no texto do botão. */
export async function getBiometricTypeLabel(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'digital';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'reconhecimento de íris';
    }
    return 'biometria';
  } catch (error) {
    devLog('Erro ao obter tipo de biometria:', error);
    return 'biometria';
  }
}

/** true se o usuário já ativou o login por biometria E ainda existe um token salvo. */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const flag = await AsyncStorage.getItem(BIOMETRIC_ENABLED_FLAG);
    if (flag !== 'true') return false;
    const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    return !!token;
  } catch (error) {
    devLog('Erro ao verificar se biometria está ativada:', error);
    return false;
  }
}

/** Guarda o token de sessão atual de forma criptografada, protegido pela biometria do sistema. */
export async function enableBiometricLogin(token: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_FLAG, 'true');
}

/** Remove o token salvo e desativa o login por biometria. */
export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  } catch (error) {
    devLog('Erro ao remover token de biometria:', error);
  }
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_FLAG, 'false');
}

export async function getStoredBiometricToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  } catch (error) {
    devLog('Erro ao ler token de biometria:', error);
    return null;
  }
}

/** Mostra o prompt nativo de biometria (digital/rosto). Retorna true se autenticou. */
export async function promptBiometricAuthentication(
  promptMessage: string = 'Confirme sua identidade para entrar'
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    devLog('Erro ao autenticar com biometria:', error);
    return false;
  }
}
