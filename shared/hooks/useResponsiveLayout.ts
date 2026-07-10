import { useWindowDimensions } from 'react-native';
import {
  BREAKPOINTS,
  getContentWidth,
  getFormFieldWidth,
  getHorizontalPadding,
  getScreenSizeCategory,
  shouldStackButtons,
} from '@/shared/constants/responsive';

/**
 * Hook central para adaptar layout por tamanho de tela.
 * Preferir este hook em vez de Dimensions.get('window') estático.
 */
export function useResponsiveLayout() {
  const { width, height, scale, fontScale } = useWindowDimensions();
  const sizeCategory = getScreenSizeCategory(width, height);
  const horizontalPadding = getHorizontalPadding(sizeCategory);

  return {
    width,
    height,
    scale,
    fontScale,
    sizeCategory,
    isCompact: sizeCategory === 'compact',
    isSmallHeight: height <= BREAKPOINTS.height.compact,
    isCompactHeight: height <= BREAKPOINTS.height.medium,
    horizontalPadding,
    contentWidth: getContentWidth(width, horizontalPadding),
    formFieldWidth: getFormFieldWidth(width),
    stackButtons: shouldStackButtons(width),
  };
}

export default useResponsiveLayout;
