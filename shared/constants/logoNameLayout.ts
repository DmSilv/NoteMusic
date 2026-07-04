import { StyleSheet } from 'react-native';

/** Mesma escala do logo na tela Bem-vindo (SelectionScreen). */
export function getLogoNameHeight(screenHeight: number): number {
  return screenHeight <= 720 ? screenHeight * 0.22 : screenHeight * 0.18;
}

export const logoNameImageStyles = StyleSheet.create({
  image: {
    width: '90%',
    backgroundColor: '#FFFFFF',
  },
});
