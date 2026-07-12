import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileAccount from '@/features/profile/screens/ProfileAccount/ProfileAccount';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext');

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: (cb: () => void | (() => void)) => {
      const React = require('react');
      React.useEffect(() => {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    },
  };
});

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

jest.mock('@/shared/components/layout/ChromeNavHeader', () => {
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

jest.mock('@/shared/services/studyReminders', () => ({
  getStudyRemindersPreferred: jest.fn(async () => false),
  setStudyRemindersEnabled: jest.fn(async () => false),
  updateReminderSchedule: jest.fn(async () => true),
  resolveReminderClock: jest.fn(() => ({ hour: 19, minute: 0 })),
}));

jest.mock('@/shared/utils/studyProfile', () => ({
  DEFAULT_REMINDER_HOUR: 19,
  formatReminderTime: (hour: number) => `${String(hour).padStart(2, '0')}:00`,
  getStudyProfile: jest.fn(async () => null),
  REMINDER_TIME_PRESETS: [8, 12, 18, 19, 21],
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProfileAccount — configuração de biometria', () => {
  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const enableBiometricLogin = jest.fn();
  const disableBiometricLogin = jest.fn();

  const baseAuthValue = {
    user: { id: '1', name: 'Maria', email: 'maria@test.com', level: 'Aprendiz' },
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

    const { getByText, getByLabelText } = render(<ProfileAccount navigation={navigation as any} />);

    expect(getByText('Entrar com digital')).toBeTruthy();
    expect(getByLabelText('Ativar ou desativar login com digital').props.value).toBe(false);
  });

  it('ativa a biometria ao ligar o switch', async () => {
    enableBiometricLogin.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      ...baseAuthValue,
      biometricHardwareAvailable: true,
      biometricLoginEnabled: false,
      biometricTypeLabel: 'digital',
    });

    const { getByLabelText } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByLabelText('Ativar ou desativar login com digital'), 'valueChange', true);

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

    const { getByLabelText } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByLabelText('Ativar ou desativar login com digital'), 'valueChange', false);

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

    const { getByLabelText } = render(<ProfileAccount navigation={navigation as any} />);

    fireEvent(getByLabelText('Ativar ou desativar login com digital'), 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Ops!',
        'Não foi possível ativar.',
        undefined,
        undefined
      );
    });
  });

  it('mostra seções no padrão do plano de estudo', () => {
    mockUseAuth.mockReturnValue({ ...baseAuthValue });

    const { getByText, getAllByText } = render(<ProfileAccount navigation={navigation as any} />);

    expect(getAllByText('Conta').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Dados da conta')).toBeTruthy();
    expect(getByText('Segurança')).toBeTruthy();
    expect(getByText('Preferências')).toBeTruthy();
    expect(getByText('Lembretes de estudo')).toBeTruthy();
    expect(getByText('Maria')).toBeTruthy();
  });
});
