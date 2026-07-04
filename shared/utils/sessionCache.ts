import AsyncStorage from '@react-native-async-storage/async-storage';
import quizService from '@/services/quizService';
import quizCompletionService from '@/services/quizCompletionService';
import quizAttemptService from '@/services/quizAttemptService';
import { clearAllUserDataCache } from '@/shared/hooks/useUserData';

const USER_SCOPED_KEY_PREFIXES = [
  '@NoteMusic:dailyChallenge',
  '@NoteMusic:quizAttempts',
];

/**
 * Limpa caches e dados locais vinculados à sessão do usuário anterior.
 * Deve ser chamado no logout e antes de popular dados de uma nova conta.
 */
export async function clearUserSessionCache(): Promise<void> {
  quizService.clearCache();
  quizCompletionService.clearCache();
  clearAllUserDataCache();

  try {
    await quizAttemptService.clearAllLocalAttempts();

    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = keys.filter((key) =>
      USER_SCOPED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
    );

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error('Erro ao limpar cache local da sessão:', error);
  }
}
