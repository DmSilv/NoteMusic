import { Alert, AlertButton, AlertOptions } from 'react-native';

export type AppAlertButton = AlertButton;

export type AppAlertVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'goodbye';

export type AppAlertOptions = AlertOptions & {
  variant?: AppAlertVariant;
  accentColor?: string;
};

export type AppAlertHandler = (
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions
) => void;

let handler: AppAlertHandler | null = null;

export function registerAppAlert(next: AppAlertHandler | null) {
  handler = next;
}

/**
 * Substitui Alert.alert com o modal padronizado do NoteMusic.
 * Se o DialogProvider ainda não estiver montado, faz fallback para o Alert nativo.
 */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions
) {
  if (handler) {
    handler(title, message, buttons, options);
    return;
  }

  Alert.alert(title, message, buttons, options);
}
