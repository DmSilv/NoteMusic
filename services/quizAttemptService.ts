import AsyncStorage from '@react-native-async-storage/async-storage';
import { quizService } from './quizService';

export interface QuizAttemptStatus {
  quizId: string;
  moduleId: string;
  attempts: {
    current: number;
    remaining: number;
    maxAttempts: number;
    lastAttemptAt: string | null;
    cooldownUntil: string | null;
  };
  canAttempt: boolean;
  reason?: string;
  message?: string;
}

export interface QuizCooldownInfo {
  isOnCooldown: boolean;
  cooldownUntil: string | null;
  timeRemaining: {
    minutes: number;
    seconds: number;
    totalMs: number;
  };
}

class QuizAttemptService {
  private readonly STORAGE_KEY = '@NoteMusic:quizAttempts';
  private readonly MAX_ATTEMPTS = 2;
  private readonly COOLDOWN_MINUTES = 30;

  /**
   * Verificar se o usuário pode tentar um quiz
   */
  async canAttemptQuiz(quizId: string, moduleId: string): Promise<QuizAttemptStatus> {
    try {
      const localStatus = await this.getLocalAttemptStatus(quizId, moduleId);
      
      // Verificar se o quiz já foi concluído com sucesso
      if (localStatus.attempts.remaining === 0 && !localStatus.attempts.cooldownUntil) {
        return {
          quizId,
          moduleId,
          attempts: localStatus.attempts,
          canAttempt: false,
          reason: 'completed',
          message: 'Quiz já foi concluído com sucesso!'
        };
      }
      
      // Verificar se está em cooldown
      if (localStatus.attempts.cooldownUntil) {
        const cooldownEnd = new Date(localStatus.attempts.cooldownUntil);
        const now = new Date();
        
        if (now < cooldownEnd) {
          return {
            quizId,
            moduleId,
            attempts: localStatus.attempts,
            canAttempt: false,
            reason: 'cooldown',
            message: `Quiz bloqueado por ${this.COOLDOWN_MINUTES} minutos após esgotar tentativas`
          };
        } else {
          // Cooldown expirou, resetar status
          await this.resetQuizAttempts(quizId, moduleId);
          return {
            quizId,
            moduleId,
            attempts: {
              current: 0,
              remaining: this.MAX_ATTEMPTS,
              maxAttempts: this.MAX_ATTEMPTS,
              lastAttemptAt: null,
              cooldownUntil: null
            },
            canAttempt: true,
            reason: 'cooldown_expired',
            message: 'Cooldown expirado, pode tentar novamente'
          };
        }
      }
      
      // Verificar se ainda tem tentativas
      if (localStatus.attempts.current >= this.MAX_ATTEMPTS) {
        // Esgotou tentativas, aplicar cooldown
        const cooldownUntil = new Date(Date.now() + (this.COOLDOWN_MINUTES * 60 * 1000));
        const updatedStatus = {
          ...localStatus,
          attempts: {
            ...localStatus.attempts,
            cooldownUntil: cooldownUntil.toISOString()
          }
        };
        
        await this.saveLocalAttemptStatus(quizId, moduleId, updatedStatus);
        
        return {
          quizId,
          moduleId,
          attempts: updatedStatus.attempts,
          canAttempt: false,
          reason: 'max_attempts_reached',
          message: `Máximo de ${this.MAX_ATTEMPTS} tentativas atingido. Quiz bloqueado por ${this.COOLDOWN_MINUTES} minutos.`
        };
      }
      
      // Pode tentar
      return {
        quizId,
        moduleId,
        attempts: localStatus.attempts,
        canAttempt: true,
        reason: 'available',
        message: `${localStatus.attempts.remaining} tentativa(s) restante(s)`
      };
      
    } catch (error) {
      // Em caso de erro, permitir tentar por segurança
      return {
        quizId,
        moduleId,
        attempts: {
          current: 0,
          remaining: this.MAX_ATTEMPTS,
          maxAttempts: this.MAX_ATTEMPTS,
          lastAttemptAt: null,
          cooldownUntil: null
        },
        canAttempt: true,
        reason: 'error_fallback',
        message: 'Erro na verificação - permitindo tentativa'
      };
    }
  }

  /**
   * Registrar uma tentativa de quiz
   */
  async registerQuizAttempt(quizId: string, moduleId: string, passed: boolean = false): Promise<QuizAttemptStatus> {
    try {
      const currentStatus = await this.getLocalAttemptStatus(quizId, moduleId);
      const newAttemptNumber = currentStatus.attempts.current + 1;
      
      // Se passou no quiz, marcar como concluído (sem cooldown)
      if (passed) {
        const completedStatus = {
          quizId,
          moduleId,
          attempts: {
            current: newAttemptNumber,
            remaining: 0,
            maxAttempts: this.MAX_ATTEMPTS,
            lastAttemptAt: new Date().toISOString(),
            cooldownUntil: null
          }
        };
        
        // Salvar status como concluído
        await this.saveLocalAttemptStatus(quizId, moduleId, completedStatus);
        
        // NÃO tentar registrar no backend quando passou - evitar erro de cooldown
        // O backend já tem a informação de que o quiz foi completado via submitQuiz
        
        return {
          ...completedStatus,
          canAttempt: false,
          reason: 'completed',
          message: 'Quiz concluído com sucesso!'
        };
      }
      
      // Se não passou, continuar com lógica normal
      const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - newAttemptNumber);
      let cooldownUntil: string | null = null;
      
      // Se esgotou tentativas E NÃO passou no quiz, aplicar cooldown
      if (newAttemptNumber >= this.MAX_ATTEMPTS && !passed) {
        cooldownUntil = new Date(Date.now() + (this.COOLDOWN_MINUTES * 60 * 1000)).toISOString();
      }
      
      const updatedStatus = {
        quizId,
        moduleId,
        attempts: {
          current: newAttemptNumber,
          remaining: remainingAttempts,
          maxAttempts: this.MAX_ATTEMPTS,
          lastAttemptAt: new Date().toISOString(),
          cooldownUntil
        }
      };
      
      // Salvar status local
      await this.saveLocalAttemptStatus(quizId, moduleId, updatedStatus);
      
      // Tentar registrar no backend apenas se não está em cooldown
      if (!cooldownUntil) {
        try {
          await quizService.registerQuizAttempt(quizId, moduleId);
        } catch (backendError) {
          // Continuar com status local se backend falhar
        }
      }
      
      return {
        ...updatedStatus,
        canAttempt: remainingAttempts > 0 && !cooldownUntil,
        reason: cooldownUntil ? 'cooldown_applied' : 'attempt_registered',
        message: cooldownUntil 
          ? `Quiz bloqueado por ${this.COOLDOWN_MINUTES} minutos`
          : `${remainingAttempts} tentativa(s) restante(s)`
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obter informações de cooldown
   */
  async getCooldownInfo(quizId: string, moduleId: string): Promise<QuizCooldownInfo> {
    try {
      const status = await this.getLocalAttemptStatus(quizId, moduleId);
      
      if (!status.attempts.cooldownUntil) {
        return {
          isOnCooldown: false,
          cooldownUntil: null,
          timeRemaining: { minutes: 0, seconds: 0, totalMs: 0 }
        };
      }
      
      const cooldownEnd = new Date(status.attempts.cooldownUntil);
      const now = new Date();
      const remaining = cooldownEnd.getTime() - now.getTime();
      
      if (remaining <= 0) {
        // Cooldown expirou
        await this.resetQuizAttempts(quizId, moduleId);
        return {
          isOnCooldown: false,
          cooldownUntil: null,
          timeRemaining: { minutes: 0, seconds: 0, totalMs: 0 }
        };
      }
      
      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      return {
        isOnCooldown: true,
        cooldownUntil: status.attempts.cooldownUntil,
        timeRemaining: { minutes, seconds, totalMs: remaining }
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter info de cooldown:', error);
      return {
        isOnCooldown: false,
        cooldownUntil: null,
        timeRemaining: { minutes: 0, seconds: 0, totalMs: 0 }
      };
    }
  }

  /**
   * Resetar tentativas de um quiz (útil para testes ou admin)
   */
  async resetQuizAttempts(quizId: string, moduleId: string): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}:${quizId}:${moduleId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Falha silenciosa
    }
  }

  /**
   * Obter status local das tentativas
   */
  private async getLocalAttemptStatus(quizId: string, moduleId: string): Promise<QuizAttemptStatus> {
    try {
      const key = `${this.STORAGE_KEY}:${quizId}:${moduleId}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const current = parsed.attempts?.current || 0;
        const remaining = Math.max(0, this.MAX_ATTEMPTS - current);
        
        return {
          quizId,
          moduleId,
          attempts: {
            current: current,
            remaining: remaining,
            maxAttempts: this.MAX_ATTEMPTS,
            lastAttemptAt: parsed.attempts?.lastAttemptAt || null,
            cooldownUntil: parsed.attempts?.cooldownUntil || null
          },
          canAttempt: true
        };
      }
      
      // Status inicial
      return {
        quizId,
        moduleId,
        attempts: {
          current: 0,
          remaining: this.MAX_ATTEMPTS,
          maxAttempts: this.MAX_ATTEMPTS,
          lastAttemptAt: null,
          cooldownUntil: null
        },
        canAttempt: true
      };
      
    } catch (error) {
      return {
        quizId,
        moduleId,
        attempts: {
          current: 0,
          remaining: this.MAX_ATTEMPTS,
          maxAttempts: this.MAX_ATTEMPTS,
          lastAttemptAt: null,
          cooldownUntil: null
        },
        canAttempt: true
      };
    }
  }

  /**
   * Salvar status local das tentativas
   */
  private async saveLocalAttemptStatus(quizId: string, moduleId: string, status: QuizAttemptStatus): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}:${quizId}:${moduleId}`;
      await AsyncStorage.setItem(key, JSON.stringify(status));
    } catch (error) {
      // Falha silenciosa
    }
  }

  /**
   * Verificar se um quiz está bloqueado
   */
  async isQuizBlocked(quizId: string, moduleId: string): Promise<boolean> {
    const status = await this.canAttemptQuiz(quizId, moduleId);
    return !status.canAttempt;
  }

  /**
   * Obter todos os quizzes bloqueados
   */
  async getAllBlockedQuizzes(): Promise<Array<{ quizId: string; moduleId: string; cooldownInfo: QuizCooldownInfo }>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const blockedQuizzes: Array<{ quizId: string; moduleId: string; cooldownInfo: QuizCooldownInfo }> = [];
      
      for (const key of keys) {
        if (key.startsWith(this.STORAGE_KEY)) {
          const parts = key.split(':');
          if (parts.length >= 4) {
            const quizId = parts[2];
            const moduleId = parts[3];
            
            const cooldownInfo = await this.getCooldownInfo(quizId, moduleId);
            if (cooldownInfo.isOnCooldown) {
              blockedQuizzes.push({ quizId, moduleId, cooldownInfo });
            }
          }
        }
      }
      
      return blockedQuizzes;
    } catch (error) {
      return [];
    }
  }
}

export const quizAttemptService = new QuizAttemptService();
export default quizAttemptService;
