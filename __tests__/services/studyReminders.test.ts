import { resolveReminderClock, weekdaysForStudyDays } from '@/shared/services/studyReminders';

jest.mock('expo-notifications', () => ({
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 2 },
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' },
}));

describe('weekdaysForStudyDays', () => {
  it('mapeia ritmo leve para seg/qua/sex', () => {
    expect(weekdaysForStudyDays('days_light')).toEqual([2, 4, 6]);
  });

  it('mapeia ritmo médio para dias úteis', () => {
    expect(weekdaysForStudyDays('days_medium')).toEqual([2, 3, 4, 5, 6]);
  });

  it('mapeia ritmo intenso para todos os dias', () => {
    expect(weekdaysForStudyDays('days_intense')).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('resolveReminderClock', () => {
  it('usa horário fixo do perfil', () => {
    expect(
      resolveReminderClock({
        reminderMode: 'fixed',
        reminderHour: 18,
        reminderMinute: 0,
      } as any)
    ).toEqual({ hour: 18, minute: 0 });
  });

  it('modo sugestão sem histórico cai em 19:00', () => {
    expect(
      resolveReminderClock({
        reminderMode: 'suggested',
        lastStudyHour: null,
      } as any)
    ).toEqual({ hour: 19, minute: 0 });
  });

  it('modo sugestão usa lastStudyHour quando existir', () => {
    expect(
      resolveReminderClock({
        reminderMode: 'suggested',
        lastStudyHour: 12,
      } as any)
    ).toEqual({ hour: 12, minute: 0 });
  });

  it('modo sugestão com hora fora da faixa 8–21 é limitada', () => {
    expect(
      resolveReminderClock({
        reminderMode: 'suggested',
        lastStudyHour: 11,
      } as any)
    ).toEqual({ hour: 11, minute: 0 });
  });
});
