/** Textos e regras alinhados do Desafio Diário (lobby + intro). */
export const DAILY_CHALLENGE_COPY = {
  title: 'Desafio do Dia',
  subtitle: '1 tentativa por dia',
  /** Regra curta (aviso / chip) */
  oneAttempt: '1 tentativa por dia',
  /** Quando a tentativa ainda está disponível */
  availableDesc:
    '1 tentativa por dia. Responda as questões e ganhe bônus. Novo desafio à meia-noite.',
  /** Quando já usou (completou ou desistiu) */
  blockedDesc:
    'Você já usou a tentativa de hoje. Novo desafio à meia-noite.',
  /** Como funciona (intro) */
  howItWorks:
    '1 tentativa por dia — sair no meio também conta. Novo desafio à meia-noite.',
  nextUnlock: 'Novo desafio à meia-noite',
  timerPrefix: 'Disponível em',
} as const;

export const DAILY_CHALLENGE_DEFAULTS = {
  questions: 5,
  timeMinutes: 10,
} as const;

export function formatDailyChallengeCountdown(
  nextAvailable: Date,
  now: Date = new Date()
): string {
  const diff = Math.max(0, nextAvailable.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
