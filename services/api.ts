import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateModuleId, validateQuizId, getInvalidIdMessage } from '../utils/validation';

// Configuração da API
const API_BASE_URL = 'http://192.168.1.4:3333/api'; // IP local da máquina
// const API_BASE_URL = 'http://10.0.2.2:3333/api'; // Para Android Emulator
// const API_BASE_URL = 'http://localhost:3333/api'; // Para iOS Simulator

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
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        console.error(`Erro na requisição ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
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
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    await this.saveToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.removeToken();
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

  // Métodos de módulos
  async getModules(): Promise<Module[]> {
    try {
      const response = await this.request('/modules');
      // Normalizar para um array de módulos
      const list = response?.modules && Array.isArray(response.modules)
        ? response.modules
        : (Array.isArray(response) ? response : []);

      // Mapear _id -> id
      return list.map((m: any) => ({
        id: m._id || m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        content: m.content,
        order: m.order,
        completedBy: m.completedBy || [],
      } as Module));
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
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

      // Usar endpoint privado que traz o quiz real do módulo
      const response = await this.request(`/quiz/${moduleId}/private`);

      // Backend retorna { success, quiz: { _id, title, questions: [{ question, options[{ label }]] } }
      const serverQuiz = response?.quiz || response;

      // Verificar estrutura
      if (serverQuiz && Array.isArray(serverQuiz.questions)) {
        // Mapear para o tipo do app
        const mapped: Quiz = {
          id: serverQuiz._id || moduleId,
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
              // isCorrect não é exposto pelo backend nas rotas privadas
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

        return mapped;
      } else {
        console.error('Resposta inesperada de /quiz (private):', response);
        throw new Error('Dados do quiz inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar quiz:', error);
      throw error;
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      // Validar se quizId é um ObjectId válido (permitir mock do diário)
      if (submission.quizId !== 'daily-challenge-mock' && !validateQuizId(submission.quizId)) {
        throw new Error(getInvalidIdMessage(submission.quizId, 'quiz'));
      }

      // Usar endpoint público para submissão
      const response = await this.request(`/quiz/${submission.quizId}/submit`, {
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
      const serverQuiz = response?.quiz || response;

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
              label: opt.optionText || opt.label,
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
        return mapped;
      }
      throw new Error('Dados do desafio diário inválidos');
    } catch (error) {
      console.error('Erro ao buscar desafio diário:', error);
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

  // Método para validar questão individual
  async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
      const response = await this.request(`/quiz/${quizId}/validate-question`, {
        method: 'POST',
        body: JSON.stringify({
          questionIndex,
          selectedAnswer
        })
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao validar questão:', error);
      throw error;
    }
  }

  // Método de health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return await this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService; 