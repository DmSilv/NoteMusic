import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateModuleId, validateQuizId, getInvalidIdMessage } from '../utils/validation';

// Configuração da API
// const API_BASE_URL = 'https://notemusic-backend-production.up.railway.app/api'; // ✅ PRODUÇÃO (Railway)
// const API_BASE_URL = 'http://localhost:3333/api'; // Para iOS Simulator
const API_BASE_URL = 'http://10.0.2.2:3333/api'; // ✅ Para Android Emulator (desenvolvimento)
// const API_BASE_URL = 'http://192.168.1.5:3333/api'; // IP local da máquina (desenvolvimento)

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
  content: string[];
  order: number;
  completedBy: string[];
  quizTimeLimit?: number; // Tempo do quiz em segundos
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

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 ApiService.request: Fazendo requisição...');
    console.log('📍 URL:', url);
    console.log('📋 Método:', options.method || 'GET');
    console.log('📤 Body:', options.body);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔑 Token incluído na requisição');
    } else {
      console.log('⚠️ Nenhum token encontrado');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('🚀 Enviando requisição...');
      const response = await fetch(url, config);
      
      console.log('📡 Resposta recebida:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        console.error(`❌ Erro na requisição ${endpoint}:`, errorMessage);
        console.error('❌ Dados do erro:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Dados da resposta:', data);
      return data;
    } catch (error: any) {
      console.error(`❌ Erro na requisição ${endpoint}:`, error);
      
      // Melhor tratamento de erro de conexão
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('Failed to connect') ||
          error.message?.includes('ECONNREFUSED') ||
          error.code === 'ECONNREFUSED') {
        throw new Error('NETWORK_ERROR');
      }
      
      throw error;
    }
  }

  // Métodos de autenticação
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    await this.saveToken(response.token);
    return response;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    console.log('🔍 ApiService: Iniciando registro...');
    console.log('📤 ApiService: Dados recebidos:', data);
    
    try {
      console.log('🌐 ApiService: Fazendo requisição para /auth/register...');
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('✅ ApiService: Resposta recebida:', response);
      
      await this.saveToken(response.token);
      console.log('✅ ApiService: Token salvo com sucesso');
      
      return response;
    } catch (error) {
      console.error('❌ ApiService: Erro na requisição:', error);
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    return await this.request('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(): Promise<User> {
    return await this.request('/auth/me');
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
    return response.user;
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
      content: m.content,
      order: m.order,
      completedBy: m.completedBy || [],
    } as Module;
  }

  async getModuleCategories(): Promise<string[]> {
    return await this.request('/modules/categories');
  }

  async completeModule(moduleId: string): Promise<void> {
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
          level: serverQuiz.level || 'iniciante',
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
          answerDetails: response.answerDetails,
          pointsEarned: response.pointsEarned,
          totalPoints: response.totalPoints,
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
          level: serverQuiz.level || 'iniciante',
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
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.request('/gamification/stats');
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