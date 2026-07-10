import { SCREEN_PRESETS } from '@/shared/constants/responsive';

type DimensionsMock = {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
};

/**
 * Simula tamanho de tela para testes de responsividade.
 * Mocka useWindowDimensions do React Native.
 */
export function mockWindowDimensions(width: number, height: number): DimensionsMock {
  const dimensions: DimensionsMock = { width, height, scale: 2, fontScale: 1 };
  jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue(dimensions);
  return dimensions;
}

export function mockScreenPreset(preset: keyof typeof SCREEN_PRESETS): DimensionsMock {
  const { width, height } = SCREEN_PRESETS[preset];
  return mockWindowDimensions(width, height);
}

export const SCREEN_CASES = [
  ['small (360x640)', SCREEN_PRESETS.small] as const,
  ['medium (390x844)', SCREEN_PRESETS.medium] as const,
  ['large (430x932)', SCREEN_PRESETS.large] as const,
];

export function restoreWindowDimensionsMock(): void {
  const rn = require('react-native');
  if (jest.isMockFunction(rn.useWindowDimensions)) {
    (rn.useWindowDimensions as jest.Mock).mockRestore();
  }
}
