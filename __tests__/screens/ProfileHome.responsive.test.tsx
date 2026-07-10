import React from 'react';
import { Animated, BackHandler } from 'react-native';
import { render } from '@testing-library/react-native';
import ProfileHome from '@/features/profile/screens/ProfileHome/profileHome';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';

jest.mock('@/contexts/AuthContext');
jest.mock('@/services/api');
jest.mock('@/services/moduleService');
jest.mock('@react-native-async-storage/async-storage');

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/shared/components/layout/LevelTopBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="level-top-bar" />;
});

jest.mock('@/shared/components/layout/MenuBottom', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="menu-bottom" />;
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProfileHome responsividade', () => {
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    getState: jest.fn(() => ({ routes: [{ name: 'ProfileHome' }], index: 0 })),
    setParams: jest.fn(),
    reset: jest.fn(),
    canGoBack: jest.fn(() => false),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(BackHandler, 'addEventListener').mockReturnValue({ remove: jest.fn() } as any);
    jest.spyOn(Animated, 'loop').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as any);

    mockUseAuth.mockReturnValue({
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
    });

    const apiService = require('@/services/api').default;
    apiService.getUserStats = jest.fn(() => new Promise(() => {}));

    const moduleService = require('@/services/moduleService').default;
    moduleService.getModuleProgress = jest.fn(() => new Promise(() => {}));
  });

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza loading sem crash em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const { getByText } = render(<ProfileHome navigation={navigation as any} />);

    expect(getByText('Carregando dados...')).toBeTruthy();
  });
});
