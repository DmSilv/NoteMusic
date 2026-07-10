import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppIntroScreen, { APP_INTRO_SLIDES } from '@/features/onboarding/screens/AppIntroScreen/AppIntroScreen';
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

describe('AppIntroScreen', () => {
  const buildNavigation = () => ({ replace: jest.fn(), navigate: jest.fn() });

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza o primeiro slide sem perguntas em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');
    const navigation = buildNavigation();

    const { getByText, queryByText } = render(<AppIntroScreen navigation={navigation as any} />);

    expect(getByText(APP_INTRO_SLIDES[0].title)).toBeTruthy();
    expect(getByText(APP_INTRO_SLIDES[0].description)).toBeTruthy();
    expect(getByText('Avançar')).toBeTruthy();
    // Não deve haver botão "Voltar" no primeiro slide.
    expect(queryByText('Voltar')).toBeNull();
  });

  it('avança entre os slides ao pressionar "Avançar" e mostra "Voltar" a partir do segundo', () => {
    const navigation = buildNavigation();
    const { getByText, queryByText } = render(<AppIntroScreen navigation={navigation as any} />);

    fireEvent.press(getByText('Avançar'));

    expect(getByText(APP_INTRO_SLIDES[1].title)).toBeTruthy();
    expect(queryByText('Voltar')).toBeTruthy();
  });

  it('volta ao slide anterior ao pressionar "Voltar"', () => {
    const navigation = buildNavigation();
    const { getByText } = render(<AppIntroScreen navigation={navigation as any} />);

    fireEvent.press(getByText('Avançar'));
    expect(getByText(APP_INTRO_SLIDES[1].title)).toBeTruthy();

    fireEvent.press(getByText('Voltar'));
    expect(getByText(APP_INTRO_SLIDES[0].title)).toBeTruthy();
  });

  it('exibe "Começar" no último slide e navega para ProfileHome ao concluir', () => {
    const navigation = buildNavigation();
    const { getByText } = render(<AppIntroScreen navigation={navigation as any} />);

    for (let i = 0; i < APP_INTRO_SLIDES.length - 1; i += 1) {
      fireEvent.press(getByText('Avançar'));
    }

    expect(getByText(APP_INTRO_SLIDES[APP_INTRO_SLIDES.length - 1].title)).toBeTruthy();
    const finishButton = getByText('Começar');
    fireEvent.press(finishButton);

    expect(navigation.replace).toHaveBeenCalledWith('ProfileHome');
  });
});
