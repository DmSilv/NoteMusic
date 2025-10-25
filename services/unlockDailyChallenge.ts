import apiService from './api';

/**
 * Função auxiliar para desbloquear o desafio diário
 * Pode ser usada em qualquer parte do app para ajudar na depuração
 */
export async function unlockDailyChallenge() {
  try {
    console.log('🔓 Solicitando desbloqueio do desafio diário...');
    
    const response = await apiService.request('/quiz/unlock-daily-challenge', {
      method: 'POST'
    });
    
    console.log('✅ Desafio diário desbloqueado com sucesso!');
    return { success: true, message: 'Desafio diário desbloqueado' };
  } catch (error) {
    console.error('❌ Erro ao desbloquear desafio diário:', error);
    return { success: false, message: 'Erro ao desbloquear desafio diário' };
  }
}

export default unlockDailyChallenge;
























