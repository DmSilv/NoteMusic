import { processError } from '@/shared/utils/errorHandler';

describe('processError', () => {
  it('mapeia erro de rede', () => {
    const result = processError(new Error('NETWORK_ERROR'));
    expect(result.title).toBe('Sem conexão');
    expect(result.message).toMatch(/internet/i);
  });

  it('mapeia código SESSION_EXPIRED', () => {
    const result = processError({ code: 'SESSION_EXPIRED', message: 'expired' });
    expect(result.title).toBe('Sessão Expirada');
  });

  it('mapeia INVALID_RESET_TOKEN', () => {
    const result = processError({ code: 'INVALID_RESET_TOKEN' });
    expect(result.message).toMatch(/inválido|expirado/i);
  });

  it('mapeia status 401 com mensagem unauthorized', () => {
    const result = processError({ status: 401, message: 'Unauthorized' });
    expect(result.title).toBe('Acesso Negado');
  });

  it('mapeia status 429 para rate limit', () => {
    const result = processError({ status: 429 });
    expect(result.title).toMatch(/Muitas Tentativas/i);
  });

  it('usa mensagem da API quando disponível', () => {
    const result = processError({
      response: { status: 400, data: { message: 'Código inválido' } },
      message: 'Código inválido',
    });
    expect(result.message).toBe('Código inválido');
  });
});
