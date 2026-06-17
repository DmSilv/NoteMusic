import apiService, { Quiz, QuizSubmission, QuestionValidationResult } from './api';
import { validateModuleId, validateQuizId, getInvalidIdMessage } from '@/shared/utils/validation';

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface QuizHistory {
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
}

class QuizService {
  // Cache para evitar múltiplas requisições
  private quizCache = new Map<string, { data: Quiz; timestamp: number }>();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutos

  async getQuiz(moduleId: string): Promise<Quiz> {
    try {
      // Validar ID
      if (!moduleId || typeof moduleId !== 'string' || moduleId.trim() === '') {
        throw new Error('ID do módulo inválido');
      }

      // Validar se moduleId é um ObjectId válido
      if (!validateModuleId(moduleId)) {
        throw new Error(getInvalidIdMessage('module'));
      }

      // Verificar cache
      const cacheKey = `quiz_${moduleId}`;
      const cached = this.quizCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
        console.log(`📦 Quiz carregado do cache: ${moduleId}`);
        return cached.data;
      }

      console.log(`🌐 Buscando quiz no servidor: ${moduleId}`);
      const quiz = await apiService.getQuiz(moduleId);
      
      // Verificar se o quiz tem a estrutura esperada
      if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error('Dados do quiz inválidos ou vazios');
      }

      // Armazenar no cache
      this.quizCache.set(cacheKey, {
        data: quiz,
        timestamp: Date.now()
      });

      return quiz;
    } catch (error) {
      console.error('❌ Erro ao buscar quiz:', error);
      throw new Error(`Falha ao carregar o quiz: ${error.message}`);
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      // Validar se quizId é um ObjectId válido (permitir mock do desafio diário)
      if (submission.quizId !== 'daily-challenge-mock' && !validateQuizId(submission.quizId)) {
        throw new Error(getInvalidIdMessage('quiz'));
      }

      const response = await apiService.submitQuiz(submission);
      
      // Verificar se a resposta é válida
      if (response && typeof response.score === 'number' && typeof response.total === 'number') {
        return {
          score: response.score,
          total: response.total,
          percentage: response.percentage || Math.round((response.score / response.total) * 100),
          feedback: response.feedback || 'Quiz submetido com sucesso!',
          timeSpent: submission.timeSpent,
          correctAnswers: response.score,
          wrongAnswers: response.total - response.score
        };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao submeter quiz:', error);
      throw error; // Propagar erro em vez de retornar mock
    }
  }

  async getQuizHistory(): Promise<QuizHistory[]> {
    return await apiService.getQuizHistory();
  }

  // ✅ NOVAS FUNÇÕES PARA GERENCIAR TENTATIVAS
  async checkQuizAttempt(quizId: string, moduleId: string): Promise<any> {
    try {
      console.log(`🔍 Verificando tentativa para quiz ${quizId} no módulo ${moduleId}`);
      
      const response = await apiService.checkQuizAttempt(quizId, moduleId);
      
      if (response && response.success) {
        console.log(`📊 Status da tentativa:`, response.data);
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tentativa:', error);
      throw error;
    }
  }

  async registerQuizAttempt(quizId: string, moduleId: string): Promise<any> {
    try {
      const response = await apiService.registerQuizAttempt(quizId, moduleId);
      
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      throw error;
    }
  }

  // ✅ NOVA FUNÇÃO: Verificar se pode iniciar quiz (validação prévia)
  async canStartQuiz(quizId: string, moduleId: string): Promise<any> {
    try {
      console.log(`🔍 Verificando se pode iniciar quiz ${quizId} no módulo ${moduleId}`);
      const response = await apiService.checkQuizAttempt(quizId, moduleId);
      if (response && response.success) {
        console.log(`📊 Status para iniciar quiz:`, response.data);
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar se pode iniciar quiz:', error);
      // Em caso de erro, permitir tentar iniciar
      return {
        canAttempt: true,
        reason: 'error_fallback',
        message: 'Erro na verificação - permitindo tentativa'
      };
    }
  }

  async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
      // Validações básicas
      if (!quizId) throw new Error('ID do quiz é obrigatório');
      if (questionIndex < 0) throw new Error('Índice da questão inválido');
      if (selectedAnswer < 0) throw new Error('Resposta selecionada inválida');

      // Validar se quizId é um ObjectId válido (permitir mock do desafio diário)
      if (quizId !== 'daily-challenge-mock' && !validateQuizId(quizId)) {
        throw new Error(getInvalidIdMessage('quiz'));
      }

      console.log(`🔍 Validando questão ${questionIndex} do quiz ${quizId}`);
      
      // Ajuste para tratar o caso do desafio diário
      // Validar se estamos no caso do desafio diário e o índice está além do disponível
      if (quizId === 'daily-challenge-mock' && questionIndex > 4) {
        console.error(`❌ Índice de questão ${questionIndex} inválido para desafio diário (max: 4)`);
        throw new Error('Índice de questão inválido para desafio diário');
      }
      
      // Tentar validação com retry em caso de erro de rede
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔍 Tentativa ${attempt}: Validando questão ${questionIndex} do quiz ${quizId}`);
          const response = await apiService.validateQuestion(quizId, questionIndex, selectedAnswer);
          
          // Se chegou até aqui, foi sucesso
          return response;
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            console.log(`⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('❌ Erro ao validar questão:', error);
      throw new Error(`Falha na validação: ${error.message}`);
    }
  }

  async getDailyChallenge(): Promise<Quiz> {
    try {
      console.log('🌟 Buscando desafio diário...');
      const response = await apiService.getDailyChallenge();
      
      // Verificar se a resposta é válida
      if (!response || !response.questions || !Array.isArray(response.questions) || response.questions.length === 0) {
        throw new Error('Dados do desafio diário inválidos ou vazios');
      }

      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar desafio diário:', error);
      throw new Error(`Falha ao carregar desafio diário: ${error.message}`);
    }
  }

  calculateScore(answers: number[], correctAnswers: number[]): number {
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        score++;
      }
    }
    return score;
  }

  getCorrectAnswers(quiz: Quiz): number[] {
    return quiz.questions.map(question => {
      const correctIndex = question.options.findIndex(option => option.isCorrect);
      
      if (correctIndex === -1) {
        // Se não encontrou opção correta, logar isso e dar mais detalhes
        console.warn(`⚠️ Questão sem resposta correta marcada: "${question.question?.substring(0, 30)}..."`);
        
        // Tentar identificar a resposta correta com base no texto da pergunta
        const questionText = question.question?.toLowerCase() || '';
        
        // Para crescendo vs diminuendo
        if (questionText.includes('crescendo') || questionText.includes('forte')) {
          console.log('   Parece ser uma questão sobre crescendo - verificando opções manualmente');
          const crescendoIndex = question.options.findIndex(opt => 
            opt.label?.toLowerCase().includes('crescendo') || 
            (opt.label?.includes('<') && !opt.label?.includes('>'))
          );
          
          if (crescendoIndex !== -1) {
            console.log(`   ✓ Encontrada possível opção correta para crescendo: ${question.options[crescendoIndex].label}`);
            return crescendoIndex;
          }
        }
        
        // Se não conseguimos identificar, retornar 0 como fallback
        console.log('   ⚠️ Usando índice 0 como fallback para resposta correta');
        return 0;
      }
      
      return correctIndex;
    });
  }

  generateFeedback(score: number, total: number): string {
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) {
      return 'Excelente! Você demonstrou um conhecimento excepcional!';
    } else if (percentage >= 70) {
      return 'Muito bom! Continue praticando para melhorar ainda mais!';
    } else if (percentage >= 50) {
      return 'Bom trabalho! Revise o conteúdo para melhorar seu desempenho.';
    } else {
      return 'Continue estudando! A prática leva à perfeição.';
    }
  }

  /**
   * Limpar cache (útil para refresh manual)
   */
  clearCache(): void {
    this.quizCache.clear();
    console.log('🧹 Cache do quiz limpo');
  }
}

export const quizService = new QuizService();
export default quizService; 