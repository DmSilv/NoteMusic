import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as biometricAuth from '@/shared/services/biometricAuth';

jest.mock('@react-native-async-storage/async-storage');

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('biometricAuth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBiometricHardwareAvailable', () => {
    it('retorna true quando há sensor e biometria cadastrada', async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      await expect(biometricAuth.isBiometricHardwareAvailable()).resolves.toBe(true);
    });

    it('retorna false quando não há sensor', async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(false);

      await expect(biometricAuth.isBiometricHardwareAvailable()).resolves.toBe(false);
      expect(mockedLocalAuth.isEnrolledAsync).not.toHaveBeenCalled();
    });

    it('retorna false quando há sensor mas nada cadastrado', async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      await expect(biometricAuth.isBiometricHardwareAvailable()).resolves.toBe(false);
    });

    it('retorna false em caso de erro', async () => {
      mockedLocalAuth.hasHardwareAsync.mockRejectedValue(new Error('falha'));

      await expect(biometricAuth.isBiometricHardwareAvailable()).resolves.toBe(false);
    });
  });

  describe('getBiometricTypeLabel', () => {
    it('retorna "Face ID" quando suporta reconhecimento facial', async () => {
      mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      await expect(biometricAuth.getBiometricTypeLabel()).resolves.toBe('Face ID');
    });

    it('retorna "digital" quando suporta impressão digital', async () => {
      mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      await expect(biometricAuth.getBiometricTypeLabel()).resolves.toBe('digital');
    });

    it('retorna "biometria" quando não identifica o tipo', async () => {
      mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([]);

      await expect(biometricAuth.getBiometricTypeLabel()).resolves.toBe('biometria');
    });
  });

  describe('isBiometricLoginEnabled', () => {
    it('retorna false quando a flag não está ativada', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      await expect(biometricAuth.isBiometricLoginEnabled()).resolves.toBe(false);
      expect(mockedSecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('retorna false quando a flag está ativada mas não há token salvo', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('true');
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      await expect(biometricAuth.isBiometricLoginEnabled()).resolves.toBe(false);
    });

    it('retorna true quando a flag está ativada e há token salvo', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('true');
      mockedSecureStore.getItemAsync.mockResolvedValue('token-abc');

      await expect(biometricAuth.isBiometricLoginEnabled()).resolves.toBe(true);
    });
  });

  describe('enableBiometricLogin / disableBiometricLogin', () => {
    it('salva o token no SecureStore e ativa a flag', async () => {
      await biometricAuth.enableBiometricLogin('meu-token');

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        'notemusic_biometric_token',
        'meu-token'
      );
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@NoteMusic:biometricEnabled',
        'true'
      );
    });

    it('remove o token do SecureStore e desativa a flag', async () => {
      await biometricAuth.disableBiometricLogin();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('notemusic_biometric_token');
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@NoteMusic:biometricEnabled',
        'false'
      );
    });
  });

  describe('promptBiometricAuthentication', () => {
    it('retorna true quando a autenticação tem sucesso', async () => {
      mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: true } as any);

      await expect(biometricAuth.promptBiometricAuthentication()).resolves.toBe(true);
    });

    it('retorna false quando o usuário cancela', async () => {
      mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: false } as any);

      await expect(biometricAuth.promptBiometricAuthentication()).resolves.toBe(false);
    });

    it('retorna false em caso de erro', async () => {
      mockedLocalAuth.authenticateAsync.mockRejectedValue(new Error('falha'));

      await expect(biometricAuth.promptBiometricAuthentication()).resolves.toBe(false);
    });
  });
});
