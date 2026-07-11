import React, { useCallback, useEffect, useState } from 'react';
import AppDialog from '@/shared/components/ui/AppDialog';
import {
  appAlert,
  registerAppAlert,
  type AppAlertButton,
  type AppAlertOptions,
} from '@/shared/utils/appAlert';

type DialogState = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  options?: AppAlertOptions;
};

const INITIAL: DialogState = {
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  options: undefined,
};

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AppAlertButton[],
      options?: AppAlertOptions
    ) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons?.length ? buttons : [{ text: 'OK' }],
        options,
      });
    },
    []
  );

  useEffect(() => {
    registerAppAlert(show);
    return () => registerAppAlert(null);
  }, [show]);

  const handleButtonPress = useCallback(
    (button: AppAlertButton) => {
      hide();
      // Deixa o modal fechar antes de navegar / side-effects
      requestAnimationFrame(() => {
        button.onPress?.();
      });
    },
    [hide]
  );

  const handleRequestClose = useCallback(() => {
    const cancelBtn = state.buttons.find((b) => b.style === 'cancel');
    hide();
    if (cancelBtn?.onPress) {
      requestAnimationFrame(() => cancelBtn.onPress?.());
    }
  }, [hide, state.buttons]);

  return (
    <>
      {children}
      <AppDialog
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        options={state.options}
        onRequestClose={handleRequestClose}
        onButtonPress={handleButtonPress}
      />
    </>
  );
}

export { appAlert };
export default DialogProvider;
