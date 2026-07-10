import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import ResetPasswordScreen from '@/features/auth/screens/ResetPassword/ResetPassword';
import apiService from '@/services/api';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

const mockForgotPassword = apiService.forgotPassword as jest.Mock;

describe('ResetPasswordScreen — reenvio de código', () => {
  const navigation = { navigate: jest.fn() };
  const route = { params: { email: 'maria@gmail.com' } };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renderiza o botão de reenviar dentro do campo de código', () => {
    const { getByText } = render(<ResetPasswordScreen navigation={navigation} route={route} />);

    expect(getByText('Código de verificação')).toBeTruthy();
    expect(getByText('Reenviar')).toBeTruthy();
  });

  it('reenvia o código e entra em cooldown', async () => {
    mockForgotPassword.mockResolvedValueOnce({ success: true, message: 'Código reenviado.' });

    const { getByText } = render(<ResetPasswordScreen navigation={navigation} route={route} />);

    await act(async () => {
      fireEvent.press(getByText('Reenviar'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockForgotPassword).toHaveBeenCalledWith('maria@gmail.com');
    expect(Alert.alert).toHaveBeenCalledWith('Código reenviado', 'Código reenviado.');
    expect(getByText('01:00')).toBeTruthy();
  });

  it('não permite reenviar de novo durante o cooldown', async () => {
    mockForgotPassword.mockResolvedValueOnce({ success: true, message: 'Código reenviado.' });

    const { getByText, queryByText } = render(
      <ResetPasswordScreen navigation={navigation} route={route} />
    );

    await act(async () => {
      fireEvent.press(getByText('Reenviar'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    expect(getByText('01:00')).toBeTruthy();
    expect(queryByText('Reenviar')).toBeNull();

    for (let i = 0; i < 60; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }

    expect(getByText('Reenviar')).toBeTruthy();
    expect(mockForgotPassword).toHaveBeenCalledTimes(1);
  });
});
