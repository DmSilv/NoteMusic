import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import * as biometricAuth from '@/shared/services/biometricAuth';

jest.mock('@react-native-async-storage/async-storage');

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    getCurrentToken: jest.fn(),
    restoreToken: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
    getDeletionStatus: jest.fn(),
  },
  normalizeUser: jest.fn((raw: any) => raw),
}));

jest.mock('@/shared/services/biometricAuth', () => ({
  isBiometricHardwareAvailable: jest.fn().mockResolvedValue(false),
  isBiometricLoginEnabled: jest.fn().mockResolvedValue(false),
  getBiometricTypeLabel: jest.fn().mockResolvedValue('biometria'),
  enableBiometricLogin: jest.fn(),
  disableBiometricLogin: jest.fn(),
  getStoredBiometricToken: jest.fn(),
  promptBiometricAuthentication: jest.fn(),
}));

const mockedApiService = apiService as jest.Mocked<typeof apiService>;
const mockedBiometricAuth = biometricAuth as jest.Mocked<typeof biometricAuth>;

async function renderAuth() {
  const rendered = renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
  // Espera os efeitos de montagem (carregamento de status de biometria)
  // resolverem antes do teste chamar as ações, evitando que o setState do
  // mount sobrescreva o estado alterado pelo teste.
  await waitFor(() => {
    expect(mockedBiometricAuth.isBiometricLoginEnabled).toHaveBeenCalled();
  });
  return rendered;
}

describe('AuthContext — biometria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(false);
    mockedBiometricAuth.isBiometricLoginEnabled.mockResolvedValue(false);
    mockedBiometricAuth.getBiometricTypeLabel.mockResolvedValue('biometria');
  });

  it('carrega o status de biometria ao montar', async () => {
    mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(true);
    mockedBiometricAuth.isBiometricLoginEnabled.mockResolvedValue(true);
    mockedBiometricAuth.getBiometricTypeLabel.mockResolvedValue('Face ID');

    const { result } = await renderAuth();

    await waitFor(() => {
      expect(result.current.biometricHardwareAvailable).toBe(true);
    });
    expect(result.current.biometricLoginEnabled).toBe(true);
    expect(result.current.biometricTypeLabel).toBe('Face ID');
  });

  describe('enableBiometricLogin', () => {
    it('lança erro quando não há token de sessão ativo', async () => {
      mockedApiService.getCurrentToken.mockReturnValue(null);
      const { result } = await renderAuth();

      await expect(act(() => result.current.enableBiometricLogin())).rejects.toThrow(
        /Faça login novamente/
      );
      expect(mockedBiometricAuth.enableBiometricLogin).not.toHaveBeenCalled();
    });

    it('salva o token atual e marca a biometria como ativada', async () => {
      mockedApiService.getCurrentToken.mockReturnValue('token-123');
      mockedBiometricAuth.enableBiometricLogin.mockResolvedValue(undefined);
      const { result } = await renderAuth();

      await act(() => result.current.enableBiometricLogin());

      expect(mockedBiometricAuth.enableBiometricLogin).toHaveBeenCalledWith('token-123');
      expect(result.current.biometricLoginEnabled).toBe(true);
    });
  });

  describe('disableBiometricLogin', () => {
    it('remove o token salvo e desativa a flag', async () => {
      const { result } = await renderAuth();

      await act(() => result.current.disableBiometricLogin());

      expect(mockedBiometricAuth.disableBiometricLogin).toHaveBeenCalled();
      expect(result.current.biometricLoginEnabled).toBe(false);
    });
  });

  describe('loginWithBiometrics', () => {
    it('lança erro quando não há hardware disponível', async () => {
      mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(false);
      const { result } = await renderAuth();

      await expect(act(() => result.current.loginWithBiometrics())).rejects.toThrow(
        /não disponível/
      );
    });

    it('lança erro quando não há token salvo', async () => {
      mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(true);
      mockedBiometricAuth.getStoredBiometricToken.mockResolvedValue(null);
      const { result } = await renderAuth();

      await expect(act(() => result.current.loginWithBiometrics())).rejects.toThrow(
        /Nenhuma sessão salva/
      );
    });

    it('lança erro quando o usuário cancela ou falha a autenticação', async () => {
      mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(true);
      mockedBiometricAuth.getStoredBiometricToken.mockResolvedValue('token-salvo');
      mockedBiometricAuth.promptBiometricAuthentication.mockResolvedValue(false);
      const { result } = await renderAuth();

      await expect(act(() => result.current.loginWithBiometrics())).rejects.toThrow(
        /confirmar sua identidade/
      );
      expect(mockedApiService.restoreToken).not.toHaveBeenCalled();
    });

    it('restaura o token e carrega o perfil quando a biometria é confirmada', async () => {
      mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(true);
      mockedBiometricAuth.getStoredBiometricToken.mockResolvedValue('token-salvo');
      mockedBiometricAuth.promptBiometricAuthentication.mockResolvedValue(true);
      mockedApiService.restoreToken.mockResolvedValue(undefined);
      mockedApiService.getProfile.mockResolvedValue({
        id: '1',
        name: 'Maria',
        email: 'maria@gmail.com',
      } as any);

      const { result } = await renderAuth();

      await act(() => result.current.loginWithBiometrics());

      expect(mockedApiService.restoreToken).toHaveBeenCalledWith('token-salvo');
      expect(result.current.user).toEqual(
        expect.objectContaining({ id: '1', email: 'maria@gmail.com' })
      );
    });

    it('desativa a biometria quando o token salvo já não é mais válido', async () => {
      mockedBiometricAuth.isBiometricHardwareAvailable.mockResolvedValue(true);
      mockedBiometricAuth.isBiometricLoginEnabled.mockResolvedValue(true);
      mockedBiometricAuth.getStoredBiometricToken.mockResolvedValue('token-expirado');
      mockedBiometricAuth.promptBiometricAuthentication.mockResolvedValue(true);
      mockedApiService.restoreToken.mockResolvedValue(undefined);
      mockedApiService.getProfile.mockRejectedValue(new Error('Sessão expirada'));

      const { result } = await renderAuth();
      await waitFor(() => expect(result.current.biometricLoginEnabled).toBe(true));

      // A asserção de rejeição fica dentro do callback do act() para que o
      // React aguarde/rastreie também o trabalho assíncrono que acontece
      // DEPOIS do reject (await disableBiometricLogin + setState), evitando
      // updates "fora do act" e leitura de result.current desatualizado.
      await act(async () => {
        await expect(result.current.loginWithBiometrics()).rejects.toThrow();
      });

      expect(mockedBiometricAuth.disableBiometricLogin).toHaveBeenCalled();
      expect(result.current.biometricLoginEnabled).toBe(false);
    });
  });
});
