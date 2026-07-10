import React from 'react';
import { render } from '@testing-library/react-native';
import UserInfo from '@/shared/components/layout/UserInfo/Userinfo';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';

jest.mock('@/contexts/AuthContext');
jest.mock('@/services/api');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('UserInfo (header nível + nome) responsividade', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Alexandre Bartholomeu', email: 'alexandre@test.com', level: 'virtuoso' },
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
    } as any);

    const apiService = require('@/services/api').default;
    apiService.getUserStats = jest.fn(() => new Promise(() => {}));
  });

  afterEach(() => {
    restoreWindowDimensionsMock();
  });

  it.each(SCREEN_CASES)('renderiza nível e nome (curto) sem crash em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const { getByText } = render(<UserInfo useRealTimeData={false} />);

    expect(getByText('Virtuoso')).toBeTruthy();
    // Nome curto: não deve ser cortado.
    expect(getByText('Alexandre Bartholomeu')).toBeTruthy();
  });

  it.each(SCREEN_CASES)('nome longo fica limitado a 1 linha com ellipsis (nunca quebra em 2 linhas) em %s', (_label) => {
    mockScreenPreset(_label.includes('360') ? 'small' : _label.includes('390') ? 'medium' : 'large');

    const longName = 'Maria Eduarda Fernandes de Oliveira Santos';
    const { getByText } = render(
      <UserInfo useRealTimeData={false} userName={longName} userSubtitle="aprendiz" />
    );

    expect(getByText('Aprendiz')).toBeTruthy();
    // O corte visual (ellipsis) é feito pelo próprio SO via numberOfLines,
    // não pelo conteúdo do texto — o que importa é nunca deixar o nome
    // quebrar em múltiplas linhas, o que descentralizava a divisória/nível.
    const nameText = getByText(longName);
    expect(nameText.props.numberOfLines).toBe(1);
    expect(nameText.props.ellipsizeMode).toBe('tail');
  });
});
