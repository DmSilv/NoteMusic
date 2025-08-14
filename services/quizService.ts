import apiService, { Quiz, QuizSubmission, QuestionValidationResult } from './api';
import { validateModuleId, validateQuizId, getInvalidIdMessage } from '../utils/validation';

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
  async getQuiz(moduleId: string): Promise<Quiz> {
    try {
      // Validar se moduleId é um ObjectId válido
      if (!validateModuleId(moduleId)) {
        throw new Error(getInvalidIdMessage(moduleId, 'módulo'));
      }

      const quiz = await apiService.getQuiz(moduleId);
      
      // Verificar se o quiz tem a estrutura esperada
      if (quiz && quiz.questions && Array.isArray(quiz.questions)) {
        return quiz;
      } else {
        console.error('Quiz inválido recebido:', quiz);
        throw new Error('Dados do quiz inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar quiz:', error);
      throw error; // Propagar erro em vez de retornar mock
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      // Validar se quizId é um ObjectId válido (permitir mock do desafio diário)
      if (submission.quizId !== 'daily-challenge-mock' && !validateQuizId(submission.quizId)) {
        throw new Error(getInvalidIdMessage(submission.quizId, 'quiz'));
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

  async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
      // Validar se quizId é um ObjectId válido (permitir mock do desafio diário)
      if (quizId !== 'daily-challenge-mock' && !validateQuizId(quizId)) {
        throw new Error(getInvalidIdMessage(quizId, 'quiz'));
      }

      const response = await apiService.validateQuestion(quizId, questionIndex, selectedAnswer);
      
      // Verificar se a resposta é válida
      if (response && typeof response.isCorrect === 'boolean') {
        return response;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao validar questão:', error);
      throw error;
    }
  }

  async getDailyChallenge(): Promise<Quiz> {
    try {
      const response = await apiService.getDailyChallenge();
      
      // Verificar se a resposta é válida
      if (response && response.questions && Array.isArray(response.questions)) {
        return response;
      } else {
        throw new Error('Dados do desafio diário inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar desafio diário:', error);
      throw error; // Propagar erro em vez de retornar mock
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
}

export const quizService = new QuizService();
export default quizService; 