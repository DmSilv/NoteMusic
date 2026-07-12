import AsyncStorage from '@react-native-async-storage/async-storage';

/** Segunda-feira da semana local no formato YYYY-MM-DD. */
export function getWeekStartKey(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = domingo
  const daysFromMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysFromMonday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

function storageKey(userId: string) {
  return `@NoteMusic:lobbyStatsRevealWeek:${userId}`;
}

export async function hasRevealedThisWeek(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const saved = await AsyncStorage.getItem(storageKey(userId));
    return saved === getWeekStartKey();
  } catch {
    return false;
  }
}

export async function markWeekRevealed(userId: string): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(storageKey(userId), getWeekStartKey());
}

export async function clearWeekReveal(userId: string): Promise<void> {
  if (!userId) return;
  await AsyncStorage.removeItem(storageKey(userId));
}
