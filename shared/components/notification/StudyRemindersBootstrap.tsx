import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/contexts/AuthContext';
import {
  areStudyRemindersSupported,
  configureStudyReminderHandler,
  STUDY_REMINDER_DATA_TYPE,
  syncStudyReminders,
  cancelStudyReminders,
} from '@/shared/services/studyReminders';
import { navigateToLevelStats } from '@/shared/navigation/navigationRef';

/**
 * Sincroniza lembretes locais com a sessão e trata toque na notificação.
 * No Expo Go (Android) fica inativo — use development build.
 */
export default function StudyRemindersBootstrap() {
  const { user, isLoading } = useAuth();
  const lastUserId = useRef<string | null>(null);
  const supported = areStudyRemindersSupported();

  useEffect(() => {
    if (!supported) return;
    configureStudyReminderHandler();
  }, [supported]);

  useEffect(() => {
    if (!supported || isLoading) return;

    const userId = user?.id ?? null;

    if (!userId) {
      if (lastUserId.current) {
        cancelStudyReminders(lastUserId.current).catch(() => {});
        lastUserId.current = null;
      }
      return;
    }

    lastUserId.current = userId;
    syncStudyReminders(userId, { requestPermission: false }).catch((error) => {
      if (__DEV__) {
        console.warn('Falha ao sincronizar lembretes de estudo:', error);
      }
    });
  }, [user?.id, isLoading, supported]);

  useEffect(() => {
    if (!supported) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string } | undefined;
      if (data?.type === STUDY_REMINDER_DATA_TYPE) {
        navigateToLevelStats();
      }
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data as { type?: string } | undefined;
      if (data?.type === STUDY_REMINDER_DATA_TYPE) {
        setTimeout(() => navigateToLevelStats(), 400);
      }
    });

    return () => subscription.remove();
  }, [supported]);

  return null;
}
