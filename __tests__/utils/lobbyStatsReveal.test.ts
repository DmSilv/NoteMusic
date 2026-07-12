import { getWeekStartKey } from '@/shared/utils/lobbyStatsReveal';

describe('lobbyStatsReveal', () => {
  it('retorna a segunda-feira da semana (quarta → segunda)', () => {
    // 2026-07-11 foi sábado; segunda dessa semana = 2026-07-06
    expect(getWeekStartKey(new Date(2026, 6, 11))).toBe('2026-07-06');
  });

  it('domingo pertence à semana que começou na segunda anterior', () => {
    // 2026-07-12 domingo → segunda 2026-07-06
    expect(getWeekStartKey(new Date(2026, 6, 12))).toBe('2026-07-06');
  });

  it('segunda é o próprio dia', () => {
    expect(getWeekStartKey(new Date(2026, 6, 6))).toBe('2026-07-06');
  });
});
