import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderMode = 'fixed' | 'suggested';

/** Preferências coletadas no onboarding — base para plano e lembretes. */
export type StudyProfile = {
  instrument: string;
  familiarity: string;
  objective: string;
  studyDays: string;
  sessionMinutes: number;
  /** Preferência para lembretes locais (expo-notifications). */
  notificationsPreferred: boolean;
  /** Hora do lembrete (0–23). Default 19. */
  reminderHour?: number;
  /** Minuto do lembrete (0–59). Default 0. */
  reminderMinute?: number;
  /** fixed = horário escolhido; suggested = heurística local. */
  reminderMode?: ReminderMode;
  /** Última hora observada de estudo (0–23), usada no modo suggested. */
  lastStudyHour?: number | null;
  updatedAt: string;
};

export const DEFAULT_REMINDER_HOUR = 19;
export const DEFAULT_REMINDER_MINUTE = 0;
export const REMINDER_TIME_PRESETS = [8, 12, 18, 19, 21] as const;

function profileKey(userId: string) {
  return `@NoteMusic:studyProfile:${userId}`;
}

export function normalizeReminderHour(hour?: number | null): number {
  if (typeof hour !== 'number' || Number.isNaN(hour)) return DEFAULT_REMINDER_HOUR;
  return Math.min(21, Math.max(8, Math.round(hour)));
}

export function formatReminderTime(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export async function getStudyProfile(userId: string): Promise<StudyProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(profileKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StudyProfile;
  } catch {
    return null;
  }
}

export async function setStudyProfile(userId: string, profile: StudyProfile): Promise<void> {
  await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

/** Mescla campos no perfil existente (cria defaults se ainda não houver). */
export async function patchStudyProfile(
  userId: string,
  patch: Partial<StudyProfile>
): Promise<StudyProfile> {
  const existing = await getStudyProfile(userId);
  const next: StudyProfile = {
    instrument: existing?.instrument || 'teoria',
    familiarity: existing?.familiarity || 'aprendiz',
    objective: existing?.objective || 'constancia',
    studyDays: existing?.studyDays || 'days_medium',
    sessionMinutes: existing?.sessionMinutes || 20,
    notificationsPreferred: existing?.notificationsPreferred ?? false,
    reminderHour: existing?.reminderHour ?? DEFAULT_REMINDER_HOUR,
    reminderMinute: existing?.reminderMinute ?? DEFAULT_REMINDER_MINUTE,
    reminderMode: existing?.reminderMode ?? 'fixed',
    lastStudyHour: existing?.lastStudyHour ?? null,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await setStudyProfile(userId, next);
  return next;
}

/** Mapeia instrumento + objetivo → categoria inicial de foco. */
export function resolveFocusCategory(instrument: string, objective: string): string {
  if (objective === 'ritmo') return 'figuras-musicais';
  if (objective === 'harmonia') return 'escalas-maiores';
  if (objective === 'leitura') return 'solfegio-basico';
  if (objective === 'prova') return 'intervalos-musicais';

  if (instrument === 'canto') return 'solfegio-basico';
  if (instrument === 'violao') return 'figuras-musicais';
  if (instrument === 'piano') return 'solfegio-basico';
  if (instrument === 'teoria') return 'propriedades-som';
  return 'solfegio-basico';
}

export function mapFamiliarityToLevel(value: string): string {
  if (value === 'virtuoso') return 'virtuoso';
  if (value === 'maestro') return 'maestro';
  return 'aprendiz';
}

export function mapStudyDaysToWeeklyGoal(value: string): number {
  if (value === 'days_light') return 3;
  if (value === 'days_intense') return 7;
  return 5;
}
