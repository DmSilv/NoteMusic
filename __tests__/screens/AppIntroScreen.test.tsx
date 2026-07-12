import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppIntroScreen, { APP_INTRO_CONTENT } from '@/features/onboarding/screens/AppIntroScreen/AppIntroScreen';
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';

jest.mock('@/shared/components/layout/LevelScreenShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', level: 'aprendiz' },
  }),
}));

describe('AppIntroScreen', () => {
  const buildNavigation = () => ({ replace: jest.fn(), navigate: jest.fn() });

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('mostra a proposta do app e os níveis em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');
    const navigation = buildNavigation();

    const { getByText } = render(<AppIntroScreen navigation={navigation as any} />);

    expect(getByText(APP_INTRO_CONTENT.title)).toBeTruthy();
    expect(getByText(APP_INTRO_CONTENT.levelsTitle)).toBeTruthy();
    expect(getByText('Aprendiz')).toBeTruthy();
    expect(getByText('Virtuoso')).toBeTruthy();
    expect(getByText('Maestro')).toBeTruthy();
    expect(getByText('Montar meu plano')).toBeTruthy();
  });

  it('navega para SelectLevelPerson ao continuar', () => {
    const navigation = buildNavigation();
    const { getByText } = render(<AppIntroScreen navigation={navigation as any} />);

    fireEvent.press(getByText('Montar meu plano'));

    expect(navigation.replace).toHaveBeenCalledWith('SelectLevelPerson');
  });
});
