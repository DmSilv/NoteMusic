import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileAccount from '@/features/profile/screens/ProfileAccount/ProfileAccount';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext');

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

jest.mock('@/shared/components/layout/MenuBottom', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="menu-bottom" />,
    getMenuBottomHeight: () => 0,
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProfileAccount — configuração de biometria', () => {
  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const enableBiometricLogin = jest.fn();
  const disableBiometricLogin = jest.fn();

  const baseAuthValue = {
    user: { id: '1', name: 'Maria', email: 'maria@test.com' },
    logout: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
    checkAuth: jest.fn(),
    refreshUserProfile: jest.fn(),
    changeTempPassword: jest.fn(),
    checkAccountStatus: jest.fn(),
    isLoading: false,
    isLoginInProgress: false,
    loginAttempts: 0,
    deactivatedAccountDetected: false,
    clearDeactivatedFlag: jest.fn(),
    biometricHardwareAvailable: false,
    biometricLoginEnabled: false,
    biometricTypeLabel: 'biometria',
    enableBiometricLogin,
    disableBiometricLogin,
    loginWithBiometrics: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('não exibe a opção de biometria quando o aparelho não suporta', () => {
    mockUseAuth.mockReturnValue({ ...baseAuthValue });

    const { queryByText } = render(<ProfileAccount navigation={navigation as any} />);

    expect(queryByText(/Entrar com/)).toBeNull();
  });

  it('exibe a opção com o switch desligado quando suportado mas não ativado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
      biometricTypeLabel: 'digital',
    });

    const { getByText, getByRole } = render(<ProfileAccount navigation={navigation as any} />);

    expect(getByText('Entrar com digital')).toBeTruthy();
    expect(getByRole('switch').props.value).toBe(false);
  });

  it('ativa a biometria ao ligar o switch', async () => {
    enableBiometricLogin.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
      biometricTypeLabel: 'digital',
    });

    const { getByRole } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByRole('switch'), 'valueChange', true);

    await waitFor(() => {
      expect(enableBiometricLogin).toHaveBeenCalled();
    });
  });

  it('desativa a biometria ao desligar o switch', async () => {
    disableBiometricLogin.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: true,
      biometricTypeLabel: 'digital',
    });

    const { getByRole } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByRole('switch'), 'valueChange', false);

    await waitFor(() => {
      expect(disableBiometricLogin).toHaveBeenCalled();
    });
  });

  it('exibe alerta de erro quando a ativação falha', async () => {
    enableBiometricLogin.mockRejectedValueOnce(new Error('Não foi possível ativar.'));
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
      biometricTypeLabel: 'digital',
    });

    const { getByRole } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByRole('switch'), 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Ops!', 'Não foi possível ativar.');
    });
  });
});
