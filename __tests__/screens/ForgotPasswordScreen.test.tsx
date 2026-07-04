import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '@/features/auth/screens/RemenberPassword';
import apiService from '@/services/api';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    forgotPassword: jest.fn(),
  },
}));

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

const mockForgotPassword = apiService.forgotPassword as jest.Mock;

describe('ForgotPasswordScreen', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    });
  });

  it('renderiza campo de e-mail e botão de envio', () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={navigation} />
    );

    expect(getByPlaceholderText('Digite seu e-mail')).toBeTruthy();
    expect(getByText('Enviar instruções')).toBeTruthy();
  });

  it('valida e-mail obrigatório', async () => {
    const { getByText } = render(<ForgotPasswordScreen navigation={navigation} />);

    fireEvent.press(getByText('Enviar instruções'));

    await waitFor(() => {
      expect(mockForgotPassword).not.toHaveBeenCalled();
    });
  });

  it('exibe mensagem genérica de sucesso', async () => {
    mockForgotPassword.mockResolvedValueOnce({
      success: true,
      message:
        'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Digite seu e-mail'), 'maria@gmail.com');
    fireEvent.press(getByText('Enviar instruções'));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('maria@gmail.com');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verifique seu e-mail',
        expect.stringMatching(/e-mail estiver cadastrado/i),
        expect.any(Array)
      );
    });
  });

  it('navega para tela de reset após sucesso', async () => {
    mockForgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Digite seu e-mail'), 'maria@gmail.com');
    fireEvent.press(getByText('Enviar instruções'));

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
        email: 'maria@gmail.com',
      });
    });
  });

  it('exibe erro amigável para falha de rede', async () => {
    mockForgotPassword.mockRejectedValueOnce(new Error('NETWORK_ERROR'));

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Digite seu e-mail'), 'maria@gmail.com');
    fireEvent.press(getByText('Enviar instruções'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sem conexão', expect.stringMatching(/internet/i));
    });
  });

  it('bloqueia múltiplos envios durante loading', async () => {
    let resolveRequest: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    mockForgotPassword.mockReturnValueOnce(pending);

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Digite seu e-mail'), 'maria@gmail.com');
    fireEvent.press(getByText('Enviar instruções'));

    await waitFor(() => {
      expect(getByText('Enviando...')).toBeTruthy();
    });

    fireEvent.press(getByText('Enviando...'));
    expect(mockForgotPassword).toHaveBeenCalledTimes(1);

    resolveRequest!({ success: true, message: 'ok' });
  });
});
