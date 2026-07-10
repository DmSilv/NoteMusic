import React from 'react';
import { ScrollView } from 'react-native';
import { render } from '@testing-library/react-native';
import ShowAccountSelectionScreen from '@/features/onboarding/screens/SelectionScreen/SelectionScreen';
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('expo-navigation-bar', () => ({
  setStyle: jest.fn(),
  setButtonStyleAsync: jest.fn(),
  setBackgroundColorAsync: jest.fn(),
}));

jest.mock('@/shared/components/layout/LevelTopBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="level-top-bar" />;
});

describe('SelectionScreen responsividade', () => {
  const navigation = { navigate: jest.fn() };

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza botões principais em %s', (_label, preset) => {
    mockScreenPreset(
      preset.width === 360 ? 'small' : preset.width === 390 ? 'medium' : 'large',
    );

    const { getByText } = render(<ShowAccountSelectionScreen navigation={navigation as any} />);

    expect(getByText('Bem-vindo ao NoteMusic')).toBeTruthy();
    expect(getByText('Criar Conta')).toBeTruthy();
    expect(getByText('Já possui conta')).toBeTruthy();
  });

  it.each(SCREEN_CASES)('nunca renderiza ScrollView (tela não pode rolar) em %s', (_label, preset) => {
    mockScreenPreset(
      preset.width === 360 ? 'small' : preset.width === 390 ? 'medium' : 'large',
    );

    const { UNSAFE_queryAllByType } = render(<ShowAccountSelectionScreen navigation={navigation as any} />);

    expect(UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
  });

  it('mantém botões lado a lado mesmo na tela pequena (360px)', () => {
    mockScreenPreset('small');

    const { getByText } = render(<ShowAccountSelectionScreen navigation={navigation as any} />);
    const createButton = getByText('Criar Conta');
    const loginButton = getByText('Já possui conta');

    expect(createButton).toBeTruthy();
    expect(loginButton).toBeTruthy();
  });
});
