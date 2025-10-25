import apiService from '../../services/api';
import { Quiz } from '../types/Quiz';

class QuizService {
  /**
   * Obtém um quiz pelo ID do módulo
   */
  async getQuiz(moduleId: string): Promise<Quiz> {
    try {
      console.log(`🔍 Buscando quiz para módulo: ${moduleId}`);
      const response = await apiService.getQuiz(moduleId);
      
      console.log(`📊 Resposta recebida:`, 
        response ? (typeof response === 'object' ? 'Objeto JSON' : typeof response) : 'undefined');
      
      const quiz = response?.quiz || response;
      
      if (!quiz) {
        console.error('❌ Quiz não encontrado na resposta', response);
        throw new Error('Quiz não encontrado');
      }
      
      console.log(`✅ Quiz obtido: ${quiz.title}, com ${quiz.questions?.length || 0} questões`);
      return quiz;
    } catch (error) {
      console.error('❌ Erro ao buscar quiz:', error);
      throw error;
    }
  }
  
  /**
   * Obtém o desafio diário
   */
  async getDailyChallenge(): Promise<Quiz> {
    try {
      console.log('🔍 Buscando desafio diário...');
      const response = await apiService.getDailyChallenge();
      
      console.log(`📊 Resposta recebida:`, 
        response ? (typeof response === 'object' ? 'Objeto JSON' : typeof response) : 'undefined');
      
      const quiz = response?.dailyChallenge || response;
      
      if (!quiz) {
        console.error('❌ Desafio diário não encontrado na resposta', response);
        throw new Error('Desafio diário não encontrado');
      }
      
      console.log(`✅ Desafio diário obtido: ${quiz.title}, com ${quiz.questions?.length || 0} questões`);
      return quiz;
    } catch (error) {
      console.error('❌ Erro ao buscar desafio diário:', error);
      throw error;
    }
  }
  
  /**
   * Valida uma resposta para uma questão
   */
  async validateQuestion(
    quizId: string, 
    questionIndex: number, 
    selectedOption: number
  ): Promise<any> {
    try {
      console.log(`🔍 Validando questão ${questionIndex} do quiz ${quizId}`);
      console.log(`📝 Resposta selecionada: ${selectedOption}`);
      
      const response = await apiService.validateQuestion(quizId, questionIndex, selectedOption);
      
      console.log(`📊 Resposta de validação:`, 
        response ? `${response.isCorrect ? '✓' : '✗'} ${response.isCorrect ? 'Correta' : 'Incorreta'}` : 'Sem dados');
      
      return response;
    } catch (error) {
      console.error(`❌ Erro ao validar questão:`, error);
      throw error;
    }
  }
  
  /**
   * Submete as respostas de um quiz
   */
  async submitQuiz(quizId: string, answers: number[], timeSpent: number): Promise<any> {
    try {
      console.log(`📝 Enviando respostas para o quiz ${quizId}`);
      console.log(`⏱️ Tempo gasto: ${timeSpent}s`);
      console.log(`📋 Respostas:`, answers);
      
      const response = await apiService.submitQuiz(quizId, answers, timeSpent);
      
      console.log(`📊 Resultado do quiz:`, 
        response ? `${response.score}/${response.total} (${response.percentage}%)` : 'Sem dados');
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao enviar respostas do quiz:', error);
      throw error;
    }
  }

  /**
   * Desbloqueia o desafio diário (para desenvolvimento)
   */
  async unlockDailyChallenge(): Promise<any> {
    try {
      console.log('🔓 Solicitando desbloqueio do desafio diário...');
      
      const response = await apiService.request('/quiz/unlock-daily-challenge', {
        method: 'POST'
      });
      
      console.log('✅ Desafio diário desbloqueado com sucesso!');
      return response;
    } catch (error) {
      console.error('❌ Erro ao desbloquear desafio diário:', error);
      throw error;
    }
  }
}

export default new QuizService();
