import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext');
jest.mock('@react-native-async-storage/async-storage');

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginScreen - login por biometria', () => {
  const login = jest.fn();
  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const clearDeactivatedFlag = jest.fn();
  const enableBiometricLogin = jest.fn();
  const loginWithBiometrics = jest.fn();

  const baseAuthValue = {
    login,
    user: null,
    isLoading: false,
    isLoginInProgress: false,
    loginAttempts: 0,
    deactivatedAccountDetected: false,
    clearDeactivatedFlag,
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    checkAuth: jest.fn(),
    refreshUserProfile: jest.fn(),
    changeTempPassword: jest.fn(),
    checkAccountStatus: jest.fn(),
    biometricHardwareAvailable: false,
    biometricLoginEnabled: false,
    biometricTypeLabel: 'biometria',
    enableBiometricLogin,
    disableBiometricLogin: jest.fn(),
    loginWithBiometrics,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('não exibe botão de biometria quando o aparelho não suporta', () => {
    mockUseAuth.mockReturnValue({ ...baseAuthValue });

    const { queryByText } = render(<LoginScreen navigation={navigation} />);

    expect(queryByText(/Entrar com/)).toBeNull();
  });

  it('não exibe botão de biometria quando suportado mas ainda não ativado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
    });

    const { queryByText } = render(<LoginScreen navigation={navigation} />);

    expect(queryByText(/Entrar com/)).toBeNull();
  });

  it('exibe botão "Entrar com biometria" quando ativado e suportado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: true,
      biometricTypeLabel: 'Face ID',
    });

    const { getByText } = render(<LoginScreen navigation={navigation} />);

    expect(getByText('Entrar com Face ID')).toBeTruthy();
  });

  it('faz login e navega quando a biometria é confirmada', async () => {
    loginWithBiometrics.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: true,
      biometricTypeLabel: 'digital',
    });

    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText('Entrar com digital'));

    await waitFor(() => {
      expect(loginWithBiometrics).toHaveBeenCalled();
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'ProfileHome' }],
      });
    });
  });

  it('exibe alerta quando a biometria falha ou é cancelada', async () => {
    loginWithBiometrics.mockRejectedValueOnce(new Error('Não foi possível confirmar sua identidade.'));
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: true,
      biometricTypeLabel: 'digital',
    });

    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText('Entrar com digital'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Não foi possível entrar',
        'Não foi possível confirmar sua identidade.'
      );
    });
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('oferece ativar biometria após login com senha bem-sucedido, quando disponível e ainda não ativada', async () => {
    login.mockResolvedValueOnce({});
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
      biometricTypeLabel: 'digital',
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByText('Acessar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Entrar com digital?',
        expect.stringContaining('digital'),
        expect.any(Array)
      );
    });
    // Navegação só ocorre depois que o usuário escolhe uma opção do alerta.
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('não oferece ativar biometria quando já está ativada', async () => {
    login.mockResolvedValueOnce({});
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: true,
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByText('Acessar'));

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'ProfileHome' }],
      });
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
