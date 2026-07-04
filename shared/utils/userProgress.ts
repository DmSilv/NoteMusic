import apiService from '@/services/api';
import quizCompletionService from '@/services/quizCompletionService';
import quizService from '@/services/quizService';
import { clearAllUserDataCache } from '@/shared/hooks/useUserData';

export interface QuizSubmitSyncInput {
  moduleId: string;
  quizId: string;
  passed: boolean;
  percentage: number;
  score: number;
  totalPoints?: number;
}

/**
 * Limpa caches de progresso do usuário logado.
 * O backend continua sendo a fonte da verdade — isso só força re-fetch.
 */
export function invalidateProgressCaches(moduleId?: string, quizId?: string): void {
  quizService.clearCache();
  clearAllUserDataCache();
  quizCompletionService.clearCache();

  if (moduleId) {
    quizCompletionService.clearQuizCache(moduleId);
  }
  if (quizId && quizId !== moduleId) {
    quizCompletionService.clearQuizCache(quizId);
  }
}

/**
 * Regra de negócio central:
 * - Quiz aprovado no backend → tenta marcar módulo como concluído (idempotente).
 * - Limpa caches locais.
 * - Atualiza perfil do usuário no AuthContext (nível, pontos persistidos).
 */
export async function syncProgressAfterQuizSubmit(
  input: QuizSubmitSyncInput,
  refreshUserProfile: () => Promise<void>
): Promise<{ moduleCompleted: boolean; profileRefreshed: boolean }> {
  const { moduleId, quizId, passed, percentage, score } = input;

  console.log('🔄 [ProgressSync] Iniciando sincronização pós-quiz:', {
    moduleId,
    quizId,
    passed,
    percentage,
    score,
  });

  let moduleCompleted = false;

  if (passed && moduleId) {
    try {
      await apiService.completeModule(moduleId);
      moduleCompleted = true;
      console.log('✅ [ProgressSync] Módulo marcado como concluído no backend:', moduleId);
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('já foi completado') || message.includes('já completado')) {
        moduleCompleted = true;
        console.log('ℹ️ [ProgressSync] Módulo já estava concluído:', moduleId);
      } else {
        console.warn('⚠️ [ProgressSync] Falha ao completar módulo (quiz já salvo):', message);
      }
    }
  }

  invalidateProgressCaches(moduleId, quizId);

  if (passed && moduleId) {
    const completionData = {
      quizId,
      score,
      percentage,
      passed: true,
      completedAt: new Date().toISOString(),
    };
    quizCompletionService.markQuizAsCompleted(moduleId, completionData);
    if (quizId !== moduleId) {
      quizCompletionService.markQuizAsCompleted(quizId, completionData);
    }
  }

  let profileRefreshed = false;
  try {
    await refreshUserProfile();
    profileRefreshed = true;
    console.log('✅ [ProgressSync] Perfil do usuário atualizado do backend');
  } catch (error) {
    console.error('❌ [ProgressSync] Falha ao atualizar perfil:', error);
  }

  return { moduleCompleted, profileRefreshed };
}
