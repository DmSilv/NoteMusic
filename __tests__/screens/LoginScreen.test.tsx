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

describe('LoginScreen', () => {
  const login = jest.fn();
  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const clearDeactivatedFlag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    mockUseAuth.mockReturnValue({
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
    });
  });

  it('renderiza campos de e-mail e senha', () => {
    const { getByPlaceholderText } = render(<LoginScreen navigation={navigation} />);

    expect(getByPlaceholderText('Digite seu melhor e-mail')).toBeTruthy();
    expect(getByPlaceholderText('Digite sua senha')).toBeTruthy();
  });

  it('exibe alerta quando login falha', async () => {
    login.mockRejectedValueOnce(new Error('Credenciais inválidas'));

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByText('Acessar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Credenciais Inválidas',
        expect.stringMatching(/incorretos/i)
      );
    });
  });

  it('exibe mensagem amigável para erro de rede', async () => {
    login.mockRejectedValueOnce(new Error('NETWORK_ERROR'));

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByText('Acessar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sem conexão', expect.stringMatching(/internet/i));
    });
  });

  it('bloqueia botão durante login em andamento', () => {
    mockUseAuth.mockReturnValue({
      login,
      user: null,
      isLoading: false,
      isLoginInProgress: true,
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
    });

    const { getByText } = render(<LoginScreen navigation={navigation} />);
    const button = getByText('Carregando...');

    fireEvent.press(button);
    expect(login).not.toHaveBeenCalled();
  });

  it('navega após login bem-sucedido', async () => {
    login.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByText('Acessar'));

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalled();
    });
  });
});
