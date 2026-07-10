import {
  BREAKPOINTS,
  getFormFieldWidth,
  getProfileImageHeight,
  getScreenSizeCategory,
  SCREEN_PRESETS,
  shouldStackButtons,
} from '@/shared/constants/responsive';

describe('responsive constants', () => {
  it('classifica telas pequenas como compact', () => {
    expect(getScreenSizeCategory(360, 640)).toBe('compact');
    expect(getScreenSizeCategory(320, 568)).toBe('compact');
  });

  it('classifica telas grandes como large', () => {
    expect(getScreenSizeCategory(430, 932)).toBe('large');
  });

  it('empilha botões em telas estreitas', () => {
    expect(shouldStackButtons(360)).toBe(true);
    expect(shouldStackButtons(390)).toBe(false);
  });

  it('calcula largura de campo de formulário com limite máximo', () => {
    expect(getFormFieldWidth(360)).toBeCloseTo(324, 0);
    expect(getFormFieldWidth(500)).toBe(400);
  });

  it('reduz altura de imagem de perfil em telas compactas', () => {
    const compact = getProfileImageHeight(SCREEN_PRESETS.small.height);
    const large = getProfileImageHeight(SCREEN_PRESETS.large.height);
    expect(compact).toBeLessThan(large);
    expect(compact).toBeLessThanOrEqual(200);
  });

  it('expõe presets usados nos testes de tela', () => {
    expect(SCREEN_PRESETS.small).toEqual({ width: 360, height: 640 });
    expect(BREAKPOINTS.width.small).toBe(360);
  });
});
