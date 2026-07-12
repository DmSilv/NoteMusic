import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getStudyFocus } from '@/shared/utils/studyFocus';
import {
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getStudyProfile,
  normalizeReminderHour,
  patchStudyProfile,
  ReminderMode,
  StudyProfile,
} from '@/shared/utils/studyProfile';

export const STUDY_REMINDER_CHANNEL_ID = 'study_reminders';
export const STUDY_REMINDER_DATA_TYPE = 'study_reminder';
/** @deprecated Use DEFAULT_REMINDER_HOUR / perfil do usuário */
export const STUDY_REMINDER_HOUR = DEFAULT_REMINDER_HOUR;
export const STUDY_REMINDER_MINUTE = DEFAULT_REMINDER_MINUTE;

const IDS_KEY = (userId: string) => `@NoteMusic:studyReminderIds:${userId}`;
const PREF_KEY = (userId: string) => `@NoteMusic:notificationsPreferred:${userId}`;

/**
 * Expo Go (Android, SDK 53+) não suporta o caminho de notifications que o app usa.
 * Use `npx expo run:android` (development build) para testar lembretes.
 */
export function areStudyRemindersSupported(): boolean {
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    return false;
  }
  return true;
}

export type ReminderEnableFailureReason = 'permission' | 'unknown';

/**
 * Motivo para alertar o usuário quando não agendou.
 * Retorna null em ambientes sem suporte (ex.: Expo Go) — sem modal técnico.
 */
export function getReminderEnableFailureReason(): ReminderEnableFailureReason | null {
  if (!areStudyRemindersSupported()) return null;
  return 'permission';
}

export function getReminderEnableFailureCopy(reason: ReminderEnableFailureReason): {
  title: string;
  message: string;
  offerSettings: boolean;
} {
  return {
    title: 'Permissão necessária',
    message:
      'Ative as notificações nas configurações do celular para receber lembretes de estudo.',
    offerSettings: true,
  };
}

/** Expo weekday: 1 = Sunday … 7 = Saturday */
export function weekdaysForStudyDays(studyDays: string): number[] {
  switch (studyDays) {
    case 'days_light':
      return [2, 4, 6];
    case 'days_intense':
      return [1, 2, 3, 4, 5, 6, 7];
    case 'days_medium':
    default:
      return [2, 3, 4, 5, 6];
  }
}

/** Heurística local: última hora de estudo observada, senão 19:00. */
export function resolveReminderClock(profile: StudyProfile | null): {
  hour: number;
  minute: number;
} {
  const mode: ReminderMode = profile?.reminderMode === 'suggested' ? 'suggested' : 'fixed';
  if (mode === 'suggested') {
    return {
      hour: normalizeReminderHour(profile?.lastStudyHour ?? DEFAULT_REMINDER_HOUR),
      minute: 0,
    };
  }
  return {
    hour: normalizeReminderHour(profile?.reminderHour ?? DEFAULT_REMINDER_HOUR),
    minute:
      typeof profile?.reminderMinute === 'number' ? profile.reminderMinute : DEFAULT_REMINDER_MINUTE,
  };
}

function buildBody(focusTitle?: string | null, remainingModules?: number | null): string {
  if (focusTitle && !focusTitle.startsWith('pending:')) {
    return `Meu próximo foco: ${focusTitle}`;
  }
  if (typeof remainingModules === 'number' && remainingModules > 0) {
    return `Faltam ${remainingModules} módulo${remainingModules === 1 ? '' : 's'} na meta da semana.`;
  }
  return 'Um módulo curto já conta para o seu plano de estudo.';
}

export async function ensureAndroidChannel(): Promise<void> {
  if (!areStudyRemindersSupported()) return;
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    name: 'Lembretes de estudo',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: '#0087D3',
    sound: 'default',
  });
}

export async function ensurePermissions(): Promise<boolean> {
  if (!areStudyRemindersSupported()) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/** Abre as configurações do app no aparelho (usuário libera notificações manualmente). */
export async function openAppNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // ignore
  }
}

export async function cancelStudyReminders(userId?: string | null): Promise<void> {
  if (!areStudyRemindersSupported()) {
    if (userId) {
      try {
        await AsyncStorage.removeItem(IDS_KEY(userId));
      } catch {
        // ignore
      }
    }
    return;
  }

  if (userId) {
    try {
      const raw = await AsyncStorage.getItem(IDS_KEY(userId));
      const ids: string[] = raw ? JSON.parse(raw) : [];
      await Promise.all(
        ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
      );
      await AsyncStorage.removeItem(IDS_KEY(userId));
    } catch {
      // ignore
    }
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => String(item.identifier || '').startsWith('study-reminder-'))
        .map((item) =>
          Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {})
        )
    );
  } catch {
    // ignore
  }
}

async function isPreferred(userId: string, profile: StudyProfile | null): Promise<boolean> {
  if (profile?.notificationsPreferred === true) return true;
  if (profile?.notificationsPreferred === false) return false;

  try {
    const flag = await AsyncStorage.getItem(PREF_KEY(userId));
    return flag === '1';
  } catch {
    return false;
  }
}

export type SyncStudyRemindersOptions = {
  remainingModules?: number | null;
  requestPermission?: boolean;
};

export async function syncStudyReminders(
  userId: string,
  options: SyncStudyRemindersOptions = {}
): Promise<boolean> {
  if (!areStudyRemindersSupported()) return false;

  const { remainingModules = null, requestPermission = true } = options;

  const profile = await getStudyProfile(userId);
  const preferred = await isPreferred(userId, profile);

  if (!preferred) {
    await cancelStudyReminders(userId);
    return false;
  }

  const hasPermission = requestPermission
    ? await ensurePermissions()
    : (await Notifications.getPermissionsAsync()).granted;

  if (!hasPermission) {
    await cancelStudyReminders(userId);
    return false;
  }

  await ensureAndroidChannel();
  await cancelStudyReminders(userId);

  const studyDays = profile?.studyDays || 'days_medium';
  const weekdays = weekdaysForStudyDays(studyDays);
  const { hour, minute } = resolveReminderClock(profile);
  const focus = await getStudyFocus(userId);
  const body = buildBody(focus?.moduleTitle, remainingModules);

  const scheduledIds: string[] = [];

  for (const weekday of weekdays) {
    const identifier = `study-reminder-${userId}-${weekday}`;
    const id = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Hora de estudar no NoteMusic',
        body,
        data: { type: STUDY_REMINDER_DATA_TYPE },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: STUDY_REMINDER_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: STUDY_REMINDER_CHANNEL_ID,
      },
    });
    scheduledIds.push(id);
  }

  await AsyncStorage.setItem(IDS_KEY(userId), JSON.stringify(scheduledIds));
  return scheduledIds.length > 0;
}

export async function setStudyRemindersEnabled(
  userId: string,
  enabled: boolean,
  options: SyncStudyRemindersOptions = {}
): Promise<boolean> {
  await patchStudyProfile(userId, { notificationsPreferred: enabled });
  await AsyncStorage.setItem(PREF_KEY(userId), enabled ? '1' : '0');

  if (!enabled) {
    await cancelStudyReminders(userId);
    return false;
  }

  return syncStudyReminders(userId, { ...options, requestPermission: true });
}

export async function updateReminderSchedule(
  userId: string,
  patch: {
    reminderMode?: ReminderMode;
    reminderHour?: number;
    reminderMinute?: number;
    lastStudyHour?: number | null;
  },
  options: SyncStudyRemindersOptions = {}
): Promise<boolean> {
  await patchStudyProfile(userId, patch);
  return syncStudyReminders(userId, { ...options, requestPermission: true });
}

/**
 * Registra a hora atual como atividade de estudo (modo "Sugestão do app").
 * Se o modo suggested estiver ativo, reagenda os lembretes com essa hora.
 */
export async function noteStudyActivity(userId: string, at: Date = new Date()): Promise<void> {
  if (!userId) return;

  const hour = normalizeReminderHour(at.getHours());
  const profile = await patchStudyProfile(userId, { lastStudyHour: hour });

  if (profile.reminderMode === 'suggested' && (await isPreferred(userId, profile))) {
    await syncStudyReminders(userId, { requestPermission: false });
  }
}

export async function getStudyRemindersPreferred(userId: string): Promise<boolean> {
  const profile = await getStudyProfile(userId);
  return isPreferred(userId, profile);
}

export async function scheduleTestReminder(): Promise<string | null> {
  if (!__DEV__) return null;
  if (!areStudyRemindersSupported()) return null;

  const ok = await ensurePermissions();
  if (!ok) return null;

  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de estudar no NoteMusic',
      body: '[DEV] Lembrete de teste do plano de estudo.',
      data: { type: STUDY_REMINDER_DATA_TYPE },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: STUDY_REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      channelId: STUDY_REMINDER_CHANNEL_ID,
    },
  });
}

export function configureStudyReminderHandler(): void {
  if (!areStudyRemindersSupported()) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}
