// Interface unificada para UserStats em todo o sistema
export interface UserStats {
  level: string;
  progress: number;
  streak: number;
  achievements: Achievement[];
  challenges: Challenge[];
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
  levelProgress: LevelProgress;
  weeklyProgressDetail: WeeklyProgressDetail;
  recentActivity: RecentActivity;
}

export interface LevelProgress {
  current: string;
  next: string;
  percentage: number;
  requirements: string;
  pointsProgress?: ProgressDetail;
  modulesProgress?: ProgressDetail;
}

export interface ProgressDetail {
  current: number;
  required: number;
  percentage: number;
}

export interface WeeklyProgressDetail {
  current: number;
  goal: number;
  percentage: number;
}

export interface RecentActivity {
  lastStudyDate: string | null;
  modulesLast7Days: number;
  quizzesLast7Days: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  completedAt?: Date;
  points: number;
  progress: number;
  maxProgress: number;
}

// Constantes para validação
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 15,
    PATTERN: /^[a-zA-ZÀ-ÿ\s]+$/
  },
  EMAIL: {
    PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
  }
} as const;

// Constantes para gamificação
export const GAMIFICATION_RULES = {
  LEVELS: {
    APRENDIZ: {
      name: 'Aprendiz',
      next: 'Virtuoso',
      modulesRequired: 2,
      pointsRequired: 150,
      color: '#4CAF50'
    },
    VIRTUOSO: {
      name: 'Virtuoso', 
      next: 'Maestro',
      modulesRequired: 4,
      pointsRequired: 300,
      color: '#2196F3'
    },
    MAESTRO: {
      name: 'Maestro',
      next: null,
      modulesRequired: null,
      pointsRequired: null,
      color: '#FF9800'
    }
  },
  POINTS: {
    QUIZ_BASE: 10,
    QUIZ_PERFECT: 20,
    MODULE_COMPLETE: 50,
    STREAK_BONUS: 5,
    DAILY_CHALLENGE: 25
  }
} as const;




