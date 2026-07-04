import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '@/services/api';

const mockFetch = global.fetch as jest.Mock;

describe('ApiService — autenticação', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('login chama endpoint correto e persiste token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'jwt-token-test',
        user: { id: '1', name: 'Maria', email: 'maria@gmail.com' },
      }),
    });

    const result = await apiService.login({
      email: 'maria@gmail.com',
      password: 'senha123',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, config] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(config.method).toBe('POST');
    expect(JSON.parse(config.body as string)).toEqual({
      email: 'maria@gmail.com',
      password: 'senha123',
    });
    expect(result.token).toBe('jwt-token-test');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@NoteMusic:token', 'jwt-token-test');
  });

  it('forgotPassword chama endpoint público sem Authorization', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.',
      }),
    });

    const result = await apiService.forgotPassword('maria@gmail.com');

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers.Authorization).toBeUndefined();
    expect(result.message).toMatch(/e-mail estiver cadastrado/i);
  });

  it('resetPassword envia payload completo', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Senha redefinida' }),
    });

    await apiService.resetPassword({
      email: 'maria@gmail.com',
      resetCode: '123456',
      newPassword: 'nova123',
      confirmPassword: 'nova123',
    });

    const [url, config] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/resetpassword');
    expect(JSON.parse(config.body as string)).toEqual({
      email: 'maria@gmail.com',
      resetCode: '123456',
      newPassword: 'nova123',
      confirmPassword: 'nova123',
    });
  });

  it('propaga erro 401 com código da API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: 'Email ou senha inválidos',
        code: 'UNAUTHORIZED',
      }),
    });

    await expect(
      apiService.login({ email: 'a@gmail.com', password: 'x' })
    ).rejects.toMatchObject({
      message: 'Email ou senha inválidos',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it('remove token local em 401 de rota protegida', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('stale-token');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: 'Sessão expirada',
        code: 'SESSION_EXPIRED',
      }),
    });

    await expect(apiService.getProfile()).rejects.toThrow('Sessão expirada');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@NoteMusic:token');
  });

  it('mapeia falha de conexão para NETWORK_ERROR', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(
      apiService.login({ email: 'a@gmail.com', password: 'x' })
    ).rejects.toThrow('NETWORK_ERROR');
  });

  it('mapeia timeout (AbortError) para NETWORK_ERROR', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);

    await expect(apiService.forgotPassword('a@gmail.com')).rejects.toThrow('NETWORK_ERROR');
  });
});
