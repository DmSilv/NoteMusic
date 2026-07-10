import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';

jest.mock('@/contexts/AuthContext');
jest.mock('@react-native-async-storage/async-storage');

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginScreen responsividade', () => {
  const navigation = { navigate: jest.fn(), reset: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      user: null,
      isLoading: false,
      isLoginInProgress: false,
      loginAttempts: 0,
      deactivatedAccountDetected: false,
      clearDeactivatedFlag: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
      checkAuth: jest.fn(),
      refreshUserProfile: jest.fn(),
      changeTempPassword: jest.fn(),
      checkAccountStatus: jest.fn(),
    });
  });

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza formulário completo em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    expect(getByPlaceholderText('Digite seu melhor e-mail')).toBeTruthy();
    expect(getByPlaceholderText('Digite sua senha')).toBeTruthy();
    expect(getByText('Acessar')).toBeTruthy();
    expect(getByText('Esqueceu sua senha?')).toBeTruthy();
  });
});
