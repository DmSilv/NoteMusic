import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { validateModuleId, validateQuizId, getInvalidIdMessage } from '@/shared/utils/validation';

const PRODUCTION_API_URL = 'https://notemusic-backend-production.up.railway.app/api';
const REQUEST_TIMEOUT_MS = 15000;

const AUTH_PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgotpassword',
  '/auth/resetpassword',
];

function devLog(...args: unknown[]) {
  if (__DEV__) {
    console.log(...args);
  }
}

function getDevApiBaseUrl(): string {
  const debuggerHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    Constants.expoGoConfig?.debuggerHost?.split(':')[0];

  if (debuggerHost && debuggerHost !== 'localhost') {
    return `http://${debuggerHost}:3333/api`;
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:3333/api';
  }

  return 'http://10.0.2.2:3333/api';
}

const API_BASE_URL = __DEV__ ? getDevApiBaseUrl() : PRODUCTION_API_URL;

if (__DEV__) {
  console.log('📡 NoteMusic API (dev):', API_BASE_URL);
}

// Tipos de dados
export interface User {
  id: string;
  name: string;
  email: string;
  level?: string;
  progress?: number;
  streak?: number;
  totalPoints?: number;
  weeklyProgress?: number;
  weeklyGoal?: number;
}

/** Normaliza respostas da API ou dados salvos no storage para o formato User. */
export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const nested =
    record.success !== undefined && record.user && typeof record.user === 'object'
      ? (record.user as Record<string, unknown>)
      : record;

  const rawId = nested.id ?? nested._id;
  const id = rawId != null ? String(rawId) : '';

  if (!id && !nested.email) {
    return null;
  }

  return {
    id,
    name: typeof nested.name === 'string' ? nested.name : '',
    email: typeof nested.email === 'string' ? nested.email : '',
    level: typeof nested.level === 'string' ? nested.level : undefined,
    progress: typeof nested.progress === 'number' ? nested.progress : undefined,
    streak: typeof nested.streak === 'number' ? nested.streak : undefined,
    totalPoints:
      typeof nested.totalPoints === 'number'
        ? nested.totalPoints
        : typeof nested.points === 'number'
          ? nested.points
          : undefined,
    weeklyProgress:
      typeof nested.weeklyProgress === 'number' ? nested.weeklyProgress : undefined,
    weeklyGoal: typeof nested.weeklyGoal === 'number' ? nested.weeklyGoal : undefined,
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  level?: string;
  weeklyGoal?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  level?: string;
  content?: string[] | { theory?: string; [key: string]: unknown };
  order: number;
  completedBy: string[];
  quizTimeLimit?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  level: string;
  type: string;
  timeLimit?: number;
  passingScore?: number; // ✅ Nota mínima para aprovação (%)
  totalQuestions?: number;
  attemptsRemaining?: number;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  questionText?: string; // Para compatibilidade
  options: {
    id: string;
    label: string;
    optionText?: string; // Para compatibilidade
    isCorrect?: boolean; // Não exposto pelo backend nas rotas privadas
  }[];
  explanation?: string;
  category?: string;
  difficulty?: string;
  points?: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: number[];
  timeSpent: number;
}

export interface QuestionValidationResult {
  isCorrect: boolean;
  selectedAnswer: {
    index: number;
    text: string;
    isCorrect: boolean;
  };
  correctAnswer: {
    index: number;
    text: string;
  };
  explanation: string | null;
  points: number;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
  timeSpent: number;
  passed?: boolean;
  totalPoints?: number;
  pointsEarned?: number;
  level?: string;
  moduleCompleted?: boolean;
  answerDetails?: Array<{
    questionIndex: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  pointsEarned?: number;
  totalPoints?: number;
  isDailyChallenge?: boolean;
  bonusPoints?: number;
}

export interface UserStats {
  level: string;
  progress: number;
  streak: number;
  achievements: any[];
  challenges: any[];
  totalModules: number;
  completedModules: number;
  weeklyGoal: number;
  weeklyProgress: number;
  nextAchievement: string;
  totalPoints: number;
  averageScorePercentage: number;
  bestCategory: string | null;
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  quizPassRate: number;
  levelProgress: {
    current: string;
    next: string;
    percentage: number;
    requirements: string;
    pointsProgress?: { current: number; required: number; percentage: number };
    modulesProgress?: { current: number; required: number; percentage: number };
  };
  weeklyProgressDetail: {
    current: number;
    goal: number;
    percentage: number;
  };
  recentActivity: {
    lastStudyDate: string | null;
    modulesLast7Days: number;
    quizzesLast7Days: number;
  };
}

// Classe principal da API
class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('@NoteMusic:token');
    } catch (error) {
      console.error('Erro ao carregar token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('@NoteMusic:token', token);
      this.token = token;
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem('@NoteMusic:token');
      this.token = null;
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  }

  /**
   * Restaura uma sessão a partir de um token já emitido (ex.: guardado no
   * SecureStore para o login por biometria). Não faz requisição — quem chama
   * deve validar o token em seguida (ex.: via getProfile()).
   */
  async restoreToken(token: string): Promise<void> {
    await this.saveToken(token);
  }

  getCurrentToken(): string | null {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    devLog('ApiService.request:', options.method || 'GET', endpoint);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const isPublicAuthEndpoint = AUTH_PUBLIC_ENDPOINTS.some((path) => endpoint.startsWith(path));

    if (this.token && !isPublicAuthEndpoint) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          (Array.isArray(errorData.errors) && errorData.errors[0]?.msg) ||
          `HTTP error! status: ${response.status}`;

        if (response.status === 401 && !isPublicAuthEndpoint) {
          await this.removeToken();
        }

        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.code = errorData.code;
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (
        error.name === 'AbortError' ||
        error.message?.includes('Network request failed') ||
        error.message?.includes('Failed to connect') ||
        error.message?.includes('ECONNREFUSED') ||
        error.code === 'ECONNREFUSED'
      ) {
        throw new Error('NETWORK_ERROR');
      }

      throw error;
    }
  }

  // Métodos de autenticação
  async login(data: LoginData): Promise<{
    user: User;
    token: string;
    requirePasswordChange?: boolean;
    warning?: string;
  }> {
    await this.removeToken();
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    await this.saveToken(response.token);
    const user = normalizeUser(response.user);
    if (!user?.id) {
      throw new Error('Resposta de login inválida: usuário sem id');
    }
    return { ...response, user };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    if (__DEV__) {
      console.log('🔍 ApiService: Iniciando registro...');
      console.log('📤 ApiService: Dados recebidos:', {
        name: data.name,
        email: data.email,
        password: '[redacted]',
      });
    }
    
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      await this.saveToken(response.token);
      
      const user = normalizeUser(response.user);
      if (!user?.id) {
        throw new Error('Resposta de registro inválida: usuário sem id');
      }
      return { ...response, user };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ ApiService: Erro na requisição de registro:', error);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Chamar endpoint de logout no backend
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    } finally {
      // Sempre remover token localmente
      await this.removeToken();
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; success: boolean }> {
    return await this.request('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string; success: boolean }> {
    return await this.request('/auth/resetpassword', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getProfile(): Promise<User> {
    const response = await this.request('/auth/me');
    const user = normalizeUser(response);
    if (!user?.id) {
      throw new Error('Perfil inválido: id do usuário não encontrado');
    }
    return user;
  }

  async getBasicInfo(): Promise<any> {
    try {
      return await this.request('/users/basic-info');
    } catch (error) {
      console.error('Erro ao buscar dados básicos:', error);
      // Retornar dados padrão em caso de erro
      return {
        success: true,
        message: 'Dados básicos disponíveis',
        defaultUser: {
          name: 'Usuário',
          level: 'Aprendiz',
          progress: 0,
          streak: 0
        }
      };
    }
  }

  async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const user = normalizeUser(response.user ?? response);
    if (!user?.id) {
      throw new Error('Resposta de atualização inválida: usuário sem id');
    }
    return user;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/changetemppassword', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Métodos de módulos
  async getModules(): Promise<Module[]> {
    try {
      console.log('🔍 Buscando todos os módulos da API...');
      const response = await this.request('/modules');
      
      console.log('📊 Resposta da API de módulos:', 
        response ? (typeof response === 'object' ? 'Objeto JSON recebido' : typeof response) : 'undefined');
      
      // Normalizar para um array de módulos
      let list;
      if (response?.modules && Array.isArray(response.modules)) {
        console.log('✅ Formato esperado: { modules: [...] }');
        list = response.modules;
      } else if (Array.isArray(response)) {
        console.log('✅ Formato alternativo: array direto');
        list = response;
      } else if (response && typeof response === 'object') {
        // Tentativa de recuperar o array de módulos de outra propriedade
        const modules = Object.values(response).find(value => Array.isArray(value));
        if (modules) {
          console.log('⚠️ Encontrado array de módulos em outra propriedade');
          list = modules;
        } else {
          console.warn('⚠️ Nenhum array encontrado na resposta, usando array vazio');
          list = [];
        }
      } else {
        console.error('❌ Formato inesperado na resposta', response);
        list = [];
      }
      
      console.log(`📚 Total de módulos encontrados: ${list.length}`);
      
      // Se tem módulos, logar um exemplo para debug
      if (list.length > 0) {
        console.log('📋 Exemplo de módulo:', {
          _id: list[0]._id,
          id: list[0].id,
          title: list[0].title,
          category: list[0].category
        });
      }

      // Mapear _id -> id e garantir que todos os campos necessários existam
      return list.map((m: any) => ({
        id: m._id || m.id || 'id-não-definido',
        title: m.title || 'Sem título',
        description: m.description || 'Sem descrição',
        category: m.category || 'geral',
        content: m.content || {},
        level: m.level || 'aprendiz',
        order: m.order || 0,
        completedBy: m.completedBy || [],
      } as Module));
    } catch (error) {
      console.error('❌ Erro ao buscar módulos:', error);
      console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getModuleById(id: string): Promise<Module> {
    const response = await this.request(`/modules/${id}`);
    const m = response?.module || response;
    return {
      id: m._id || m.id,
      title: m.title,
      description: m.description,
      category: m.category,
      level: m.level,
      content: m.content,
      order: m.order,
      completedBy: m.completedBy || [],
      quizTimeLimit: m.quizTimeLimit,
    } as Module;
  }

  async getModuleCategories(): Promise<string[]> {
    return await this.request('/modules/categories');
  }

  async completeModule(moduleId: string): Promise<{ success?: boolean; message?: string; pointsEarned?: number; totalPoints?: number; level?: string }> {
    return await this.request(`/modules/${moduleId}/complete`, {
      method: 'POST',
    });
  }

  // Métodos de quiz
  async getQuiz(moduleId: string): Promise<Quiz> {
    try {
      // Validar se moduleId é um ObjectId válido
      if (!validateModuleId(moduleId)) {
        throw new Error(getInvalidIdMessage(moduleId, 'módulo'));
      }

      console.log(`🔍 Buscando quiz para módulo: ${moduleId}`);
      
      // Usar o endpoint correto no backend
      const response = await this.request(`/quiz/${moduleId}`);
      
      // Registrar resposta para debug
      console.log(`📊 Resposta do servidor para quiz ${moduleId}:`, 
        response ? 'Dados recebidos' : 'Nenhum dado');

      // Backend retorna { success, quiz: { _id, title, questions: [{ question, options[{ label }]] } }
      const serverQuiz = response?.quiz || response;
      
      console.log(`📋 Dados do quiz:`, 
        serverQuiz ? `Título: ${serverQuiz.title}, Questões: ${serverQuiz.questions?.length || 0}` : 'Dados inválidos');

      // Verificar estrutura
      if (serverQuiz && Array.isArray(serverQuiz.questions)) {
        // Mapear para o tipo do app
        const mapped: Quiz = {
          id: serverQuiz._id || serverQuiz.id || moduleId,
          title: serverQuiz.title,
          description: serverQuiz.description || '',
          category: serverQuiz.category || 'module',
          questions: serverQuiz.questions.map((q: any) => ({
            _id: q._id,
            question: q.question || q.questionText,
            questionText: q.question || q.questionText, // Para compatibilidade
            options: (q.options || []).map((opt: any) => ({
              id: opt.id || opt._id,
              label: opt.label || opt.optionText,
              optionText: opt.label || opt.optionText, // Para compatibilidade
              // isCorrect não é exposto pelo backend nas rotas públicas
              isCorrect: false
            })),
            explanation: q.explanation || '',
            category: q.category,
            difficulty: q.difficulty,
            points: q.points
          })),
          level: serverQuiz.level || 'aprendiz',
          type: serverQuiz.type || 'module',
          timeLimit: serverQuiz.timeLimit,
          totalQuestions: serverQuiz.totalQuestions || serverQuiz.questions.length,
          attemptsRemaining: serverQuiz.attemptsRemaining
        };
        
        console.log(`✅ Quiz mapeado com sucesso:`, 
          `ID: ${mapped.id}, Título: ${mapped.title}, Questões: ${mapped.questions.length}`);

        return mapped;
      } else {
        console.error('❌ Resposta inesperada de /quiz:', serverQuiz);
        throw new Error('Dados do quiz inválidos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar quiz:', error);
      throw error;
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      // Validar se quizId é um ObjectId válido (permitir mock do diário)
      if (submission.quizId !== 'daily-challenge-mock' && !validateQuizId(submission.quizId)) {
        throw new Error(getInvalidIdMessage(submission.quizId, 'quiz'));
      }

      // ✅ USAR ENDPOINT PRIVADO PARA SALVAR PONTOS NO USUÁRIO
      // A rota /submit/private requer autenticação e salva os pontos no perfil do usuário
      const response = await this.request(`/quiz/${submission.quizId}/submit/private`, {
        method: 'POST',
        body: JSON.stringify(submission),
      });
      
      // Verificar se a resposta é válida e mapear para QuizResult
      if (response && typeof response.score === 'number' && typeof response.total === 'number') {
        return {
          score: response.score,
          total: response.total,
          percentage: response.percentage || Math.round((response.score / response.total) * 100),
          feedback: response.feedback || 'Quiz completado!',
          timeSpent: response.timeSpent || submission.timeSpent,
          passed: response.passed,
          answerDetails: response.answerDetails,
          pointsEarned: response.pointsEarned,
          totalPoints: response.totalPoints,
          level: response.level,
          moduleCompleted: response.moduleCompleted,
          isDailyChallenge: response.isDailyChallenge,
          bonusPoints: response.bonusPoints
        };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao submeter quiz:', error);
      throw error;
    }
  }

  async getQuizHistory(): Promise<any[]> {
    return await this.request('/quiz/history');
  }

  async getDailyChallenge(): Promise<Quiz> {
    try {
      const response = await this.request('/quiz/daily-challenge');
      
      // Verificar se temos dailyChallenge na resposta (formato correto do backend)
      const serverQuiz = response?.dailyChallenge || response?.quiz || response;
      
      console.log('📊 Resposta de desafio diário recebida:', 
        serverQuiz ? `Título: ${serverQuiz.title}, Questões: ${serverQuiz.questions?.length || 0}` : 'Nenhum dado');

      // Verificar se a resposta é válida e mapear para o tipo do app
      if (serverQuiz && serverQuiz.questions && Array.isArray(serverQuiz.questions)) {
        const mapped: Quiz = {
          id: serverQuiz.id || serverQuiz._id || 'daily-challenge-mock',
          title: serverQuiz.title || 'Desafio Diário',
          description: serverQuiz.description || '',
          category: 'daily',
          questions: serverQuiz.questions.map((q: any) => ({
            _id: q._id,
            question: q.question || q.questionText,
            questionText: q.question || q.questionText, // Para compatibilidade
            options: (q.options || []).map((opt: any) => ({
              id: opt.id || opt._id,
              label: opt.label || opt.optionText,
              optionText: opt.optionText || opt.label, // Para compatibilidade
              isCorrect: opt.isCorrect || false
            })),
            explanation: q.explanation || '',
            category: q.category,
            difficulty: q.difficulty,
            points: q.points
          })),
          level: serverQuiz.level || 'aprendiz',
          type: serverQuiz.type || 'daily-challenge',
          timeLimit: serverQuiz.timeLimit,
          totalQuestions: serverQuiz.questions.length
        };
        
        console.log('✅ Desafio diário mapeado com sucesso:', 
          `ID: ${mapped.id}, Título: ${mapped.title}, Questões: ${mapped.questions.length}`);
        return mapped;
      }
      
      console.error('❌ Estrutura de desafio diário inválida:', serverQuiz);
      throw new Error('Dados do desafio diário inválidos');
    } catch (error) {
      console.error('❌ Erro ao buscar desafio diário:', error);
      throw error;
    }
  }

  // Métodos de gamificação
  async getUserStats(forceRefresh = false): Promise<UserStats> {
    try {
      const query = forceRefresh ? '?_refresh=true' : '';
      const response = await this.request(`/gamification/stats${query}`);
      const stats = response.stats || response;
      
      // Mapear para a interface UserStats
      return {
        level: stats.level || 'Iniciante',
        progress: stats.progress || 0,
        streak: stats.currentStreak || stats.streak || 0,
        achievements: stats.achievements || [],
        challenges: stats.challenges || [],
        totalModules: stats.totalModules || 12,
        completedModules: stats.completedModules || 0,
        weeklyGoal: stats.weeklyGoal || 5,
        weeklyProgress: stats.weeklyProgress || 0,
        nextAchievement: stats.nextAchievement || 'Complete seu primeiro módulo',
        totalPoints: stats.totalPoints || 0,
        averageScorePercentage: stats.averageScorePercentage || 0,
        bestCategory: stats.bestCategory || null,
        currentStreak: stats.currentStreak || stats.streak || 0,
        longestStreak: stats.longestStreak || 0,
        totalStudyDays: stats.totalStudyDays || 0,
        quizPassRate: stats.quizPassRate || 0,
        levelProgress: stats.levelProgress || {
          current: stats.level || 'Iniciante',
          next: 'Intermediário',
          percentage: 0,
          requirements: 'Complete 3 módulos OU ganhe 300 pontos'
        },
        weeklyProgressDetail: stats.weeklyProgressDetail || {
          current: stats.weeklyProgress || 0,
          goal: stats.weeklyGoal || 5,
          percentage: 0
        },
        recentActivity: stats.recentActivity || {
          lastStudyDate: null,
          modulesLast7Days: 0,
          quizzesLast7Days: 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar estatísticas padrão em caso de erro
      return {
        level: 'Iniciante',
        progress: 0,
        streak: 0,
        achievements: [],
        challenges: [],
        totalModules: 12,
        completedModules: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
        nextAchievement: 'Complete seu primeiro módulo',
        totalPoints: 0,
        averageScorePercentage: 0,
        bestCategory: null,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyDays: 0,
        quizPassRate: 0,
        levelProgress: {
          current: 'Iniciante',
          next: 'Intermediário',
          percentage: 0,
          requirements: 'Complete 3 módulos OU ganhe 300 pontos'
        },
        weeklyProgressDetail: {
          current: 0,
          goal: 5,
          percentage: 0
        },
        recentActivity: {
          lastStudyDate: null,
          modulesLast7Days: 0,
          quizzesLast7Days: 0
        }
      };
    }
  }

  async getAchievements(): Promise<any[]> {
    return await this.request('/gamification/achievements');
  }

  async getChallenges(): Promise<any[]> {
    return await this.request('/gamification/challenges');
  }

  async getLeaderboard(): Promise<any[]> {
    return await this.request('/gamification/leaderboard');
  }

  // Método para obter conclusão de categorias
  async getCategoryCompletion(level?: string): Promise<any> {
    try {
      // O endpoint correto está no controlador de gamificação
      const endpoint = level ? `/gamification/category-completion?level=${level}` : '/gamification/category-completion';
      return await this.request(endpoint);
    } catch (error) {
      console.error('Erro ao carregar conclusão de categorias:', error);
      // Retornar objeto vazio em caso de erro
      return { categoryCompletion: [] };
    }
  }

  // Métodos de exclusão de conta
  async requestAccountDeletion(data: {
    password: string;
    confirmation: string;
    reason?: string;
  }): Promise<any> {
    return await this.request('/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelAccountDeletion(): Promise<any> {
    return await this.request('/auth/cancel-deletion', {
      method: 'POST',
    });
  }

  async getDeletionStatus(): Promise<any> {
    return await this.request('/auth/deletion-status');
  }

  // Método para validar questão individual
  async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
      console.log(`🔍 API: Validando questão ${questionIndex} do quiz ${quizId}, resposta: ${selectedAnswer}`);
      
      // Usar o endpoint correto conforme definido no backend (quiz.routes.js)
      // A rota correta é /quiz/:quizId/validate/:questionIndex
      const response = await this.request(`/quiz/${quizId}/validate/${questionIndex}`, {
        method: 'POST',
        body: JSON.stringify({
          selectedAnswer
        })
      });
      
      // Verificar se a resposta tem a estrutura esperada
      if (!response || typeof response.isCorrect !== 'boolean') {
        console.error('❌ Resposta inválida da validação:', response);
        throw new Error('Resposta inválida do servidor na validação da questão');
      }
      
      console.log(`✅ Validação recebida: ${response.isCorrect ? 'Correta' : 'Incorreta'}`);
      return response;
    } catch (error) {
      console.error('Erro ao validar questão:', error);
      throw error;
    }
  }

  // Método para verificar tentativas do quiz
  async checkQuizAttempt(quizId: string, moduleId: string): Promise<any> {
    try {
      console.log(`🔍 API: Verificando tentativas do quiz ${quizId} para o módulo ${moduleId}`);
      
      // Endpoint para verificar tentativas (endpoint pode não existir no backend ainda)
      // Por enquanto, retornar resposta padrão que permite tentativa
      return {
        success: true,
        data: {
          canAttempt: true,
          attempts: {
            current: 0,
            remaining: 3,
            maxAttempts: 3
          },
          cooldownUntil: null
        }
      };
    } catch (error) {
      console.error('Erro ao verificar tentativas do quiz:', error);
      // Em caso de erro, permitir tentativa
      return {
        success: true,
        data: {
          canAttempt: true,
          attempts: {
            current: 0,
            remaining: 3,
            maxAttempts: 3
          },
          cooldownUntil: null
        }
      };
    }
  }

  // Método de health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return await this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService; 