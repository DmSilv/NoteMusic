import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLevelColors } from '@/shared/constants/theme';
import { getLevelTheme, LevelChromeTheme } from '@/shared/constants/levelTheme';

/**
 * Resolve tema de chrome pelo nível do usuário ou override explícito.
 * Recalcula quando o nível muda (troca de tela / atualização de stats).
 */
export function useLevelTheme(levelOverride?: string | null): {
  level: string;
  chrome: LevelChromeTheme;
  colors: ReturnType<typeof getLevelColors>;
} {
  const { user } = useAuth();
  const level = levelOverride ?? user?.level ?? 'aprendiz';

  const chrome = useMemo(() => getLevelTheme(level), [level]);
  const colors = useMemo(() => getLevelColors(level), [level]);

  return { level, chrome, colors };
}

export default useLevelTheme;
