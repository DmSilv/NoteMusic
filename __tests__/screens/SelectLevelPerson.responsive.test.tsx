import React from 'react';
import { render } from '@testing-library/react-native';
import SelectLevelPerson from '@/features/onboarding/screens/SelectLevelPerson/SelectLevelPerson';
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

describe('SelectLevelPerson responsividade', () => {
  const navigation = { replace: jest.fn() };

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza pergunta e opções em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const { getByText } = render(<SelectLevelPerson navigation={navigation} />);

    expect(getByText('Passo 1 de 3')).toBeTruthy();
    expect(getByText('Qual seu maior objetivo com teoria musical?')).toBeTruthy();
    expect(getByText('Próximo')).toBeTruthy();
    expect(getByText('Ler partituras com facilidade')).toBeTruthy();
  });
});
