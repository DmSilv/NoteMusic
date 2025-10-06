import apiService from './api';

interface QuizCompletionData {
  quizId: string;
  score: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

interface QuizCompletionStatus {
  isCompleted: boolean;
  completionData: QuizCompletionData | null;
}

class QuizCompletionService {
  private completionCache: Map<string, QuizCompletionStatus> = new Map();

  /**
   * Verificar se um quiz foi concluído pelo usuário
   */
  async checkQuizCompletion(quizId: string): Promise<QuizCompletionStatus> {
    try {
      // Verificar cache primeiro
      if (this.completionCache.has(quizId)) {
        return this.completionCache.get(quizId)!;
      }

      const response = await apiService.request(`/quiz/${quizId}/completion-status`);
      
      const status: QuizCompletionStatus = {
        isCompleted: response.isCompleted || false,
        completionData: response.completionData || null
      };

      // Cache do resultado
      this.completionCache.set(quizId, status);
      
      return status;
    } catch (error) {
      console.error('Erro ao verificar conclusão do quiz:', error);
      return {
        isCompleted: false,
        completionData: null
      };
    }
  }

  /**
   * Verificar conclusão de múltiplos quizzes
   */
  async checkMultipleQuizCompletions(quizIds: string[]): Promise<Map<string, QuizCompletionStatus>> {
    const results = new Map<string, QuizCompletionStatus>();
    
    // Usar Promise.all para verificar todos em paralelo
    const promises = quizIds.map(async (quizId) => {
      const status = await this.checkQuizCompletion(quizId);
      results.set(quizId, status);
    });
    
    await Promise.all(promises);
    return results;
  }

  /**
   * Verificar conclusão de quiz por módulo
   */
  async checkModuleQuizCompletion(moduleId: string): Promise<QuizCompletionStatus> {
    try {
      // Para módulos, o ID do quiz geralmente é igual ao ID do módulo
      // ou você pode ter uma lógica específica aqui
      return await this.checkQuizCompletion(moduleId);
    } catch (error) {
      console.error('Erro ao verificar conclusão do quiz do módulo:', error);
      return {
        isCompleted: false,
        completionData: null
      };
    }
  }

  /**
   * Marcar quiz como concluído no cache local
   * (usado após submissão bem-sucedida)
   */
  markQuizAsCompleted(quizId: string, completionData: QuizCompletionData): void {
    this.completionCache.set(quizId, {
      isCompleted: true,
      completionData
    });
  }

  /**
   * Limpar cache de conclusão
   */
  clearCache(): void {
    this.completionCache.clear();
  }

  /**
   * Limpar cache específico de um quiz
   */
  clearQuizCache(quizId: string): void {
    this.completionCache.delete(quizId);
  }

  /**
   * Obter estatísticas gerais de quizzes do usuário
   */
  async getQuizStats(): Promise<{
    totalQuizzes: number;
    passedQuizzes: number;
    passRate: number;
    averageScore: number;
    averagePercentage: number;
    totalPoints: number;
    lastQuizDate: string | null;
    lastQuizPassed: boolean | null;
  }> {
    try {
      const response = await apiService.request('/quiz/stats');
      return response.stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de quiz:', error);
      return {
        totalQuizzes: 0,
        passedQuizzes: 0,
        passRate: 0,
        averageScore: 0,
        averagePercentage: 0,
        totalPoints: 0,
        lastQuizDate: null,
        lastQuizPassed: null
      };
    }
  }

  /**
   * Obter histórico de quizzes completados
   */
  async getQuizHistory(page: number = 1, limit: number = 10): Promise<{
    quizzes: QuizCompletionData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalQuizzes: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    try {
      const response = await apiService.request(`/quiz/history?page=${page}&limit=${limit}`);
      return {
        quizzes: response.quizzes || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalQuizzes: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    } catch (error) {
      console.error('Erro ao obter histórico de quiz:', error);
      return {
        quizzes: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalQuizzes: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }
}

export default new QuizCompletionService();
