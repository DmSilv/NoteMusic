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
  async checkQuizCompletion(quizId: string, forceRefresh: boolean = false): Promise<QuizCompletionStatus> {
    try {
      // ✅ Se forçar atualização, ignorar cache
      if (!forceRefresh && this.completionCache.has(quizId)) {
        return this.completionCache.get(quizId)!;
      }

      console.log(`🔍 Verificando conclusão do quiz ${quizId}${forceRefresh ? ' (forçando atualização)' : ''}`);
      const response = await apiService.request(`/quiz/${quizId}/completion-status`);
      
      const status: QuizCompletionStatus = {
        isCompleted: response.isCompleted || false,
        completionData: response.completionData || null
      };

      // Cache do resultado
      this.completionCache.set(quizId, status);
      console.log(`✅ Status do quiz ${quizId}: ${status.isCompleted ? 'COMPLETO' : 'NÃO COMPLETO'}`);
      
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
   * ✅ Otimizado para evitar erro 429: processa em batches com delay entre requisições
   */
  async checkMultipleQuizCompletions(quizIds: string[], forceRefresh: boolean = false): Promise<Map<string, QuizCompletionStatus>> {
    const results = new Map<string, QuizCompletionStatus>();
    
    // ✅ Filtrar IDs que já estão em cache (evitar requisições desnecessárias)
    const idsToCheck = forceRefresh 
      ? quizIds 
      : quizIds.filter(id => !this.completionCache.has(id));
    
    // Se todos já estão em cache, retornar do cache
    if (idsToCheck.length === 0) {
      quizIds.forEach(id => {
        if (this.completionCache.has(id)) {
          results.set(id, this.completionCache.get(id)!);
        }
      });
      return results;
    }
    
    console.log(`📊 Verificando ${idsToCheck.length} quizzes (${quizIds.length - idsToCheck.length} do cache)`);
    
    // ✅ Processar em batches de 5 quizzes por vez com delay de 100ms entre batches
    // Isso evita sobrecarregar o servidor e causar erro 429
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 100; // 100ms entre batches
    
    for (let i = 0; i < idsToCheck.length; i += BATCH_SIZE) {
      const batch = idsToCheck.slice(i, i + BATCH_SIZE);
      
      // Processar batch em paralelo
      const batchPromises = batch.map(async (quizId) => {
        try {
          const status = await this.checkQuizCompletion(quizId, forceRefresh);
          results.set(quizId, status);
        } catch (error: any) {
          // ✅ Tratar erro 429 especificamente
          if (error?.response?.status === 429 || error?.status === 429) {
            console.warn(`⚠️ Rate limit atingido. Aguardando antes de continuar...`);
            // Aguardar mais tempo antes de continuar
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
            // Tentar novamente apenas este quiz
            try {
              const status = await this.checkQuizCompletion(quizId, forceRefresh);
              results.set(quizId, status);
            } catch (retryError) {
              console.error(`❌ Erro ao verificar quiz ${quizId} após retry:`, retryError);
              results.set(quizId, { isCompleted: false, completionData: null });
            }
          } else {
            console.error(`❌ Erro ao verificar quiz ${quizId}:`, error);
            results.set(quizId, { isCompleted: false, completionData: null });
          }
        }
      });
      
      await Promise.all(batchPromises);
      
      // ✅ Delay entre batches para evitar rate limiting
      if (i + BATCH_SIZE < idsToCheck.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // ✅ Adicionar resultados do cache para os IDs que não foram verificados
    quizIds.forEach(id => {
      if (!results.has(id) && this.completionCache.has(id)) {
        results.set(id, this.completionCache.get(id)!);
      }
    });
    
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
