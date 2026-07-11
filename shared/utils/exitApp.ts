import { Platform } from 'react-native';
import { BackHandler } from 'react-native';
import { appAlert } from '@/shared/utils/appAlert';

/**
 * Encerra o processo do app sem limpar sessão/storage.
 * No iOS a Apple não permite fechar o app por código.
 */
export function exitApp(): void {
  if (Platform.OS === 'android') {
    BackHandler.exitApp();
    return;
  }

  appAlert(
    'Fechar o aplicativo',
    'No iPhone não é possível fechar o app por um botão. Use o gesto do sistema (deslizar para cima a partir da barra inferior) para sair. Sua conta permanece conectada.',
    [{ text: 'Entendi', style: 'default' }],
    { variant: 'info' }
  );
}

/** Confirmação padronizada antes de fechar o app (sem deslogar). */
export function confirmExitApp(): void {
  appAlert(
    'Até logo!',
    'Seu progresso fica guardado. Quando voltar, sua conta e sua jornada musical continuam de onde parou.',
    [
      { text: 'Continuar estudando', style: 'cancel' },
      { text: 'Até mais', onPress: () => exitApp() },
    ],
    { variant: 'goodbye', cancelable: true }
  );
}
