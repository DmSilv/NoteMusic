import React from 'react';
import { render } from '@testing-library/react-native';
import SelectLevelPerson, {
  PLAN_STEPS,
} from '@/features/onboarding/screens/SelectLevelPerson/SelectLevelPerson';
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
    updateUser: jest.fn(),
  }),
}));

describe('SelectLevelPerson — plano de estudo', () => {
  const navigation = { replace: jest.fn(), navigate: jest.fn() };

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza primeira pergunta do plano em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const { getByText, queryByText } = render(<SelectLevelPerson navigation={navigation} />);

    expect(getByText(`Etapa 1 de ${PLAN_STEPS.length}`)).toBeTruthy();
    expect(getByText(PLAN_STEPS[0].question)).toBeTruthy();
    expect(getByText('Próximo')).toBeTruthy();
    expect(getByText('Piano ou teclado')).toBeTruthy();
    // Aviso de alteração só na última tela
    expect(queryByText(/alterar meta e foco depois/i)).toBeNull();
  });
});
