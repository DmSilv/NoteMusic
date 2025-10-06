import { Achievement, Challenge, GAMIFICATION_RULES } from '../types/UserStats';

export class AchievementService {
  // Conquistas disponíveis
  private static achievements: Achievement[] = [
    {
      id: 'first_quiz',
      name: 'Primeiro Quiz',
      description: 'Complete seu primeiro quiz',
      icon: 'trophy',
      unlocked: false,
      points: 10
    },
    {
      id: 'first_module',
      name: 'Primeiro Módulo',
      description: 'Complete seu primeiro módulo',
      icon: 'book-open',
      unlocked: false,
      points: 25
    },
    {
      id: 'streak_3',
      name: 'Sequência de 3',
      description: 'Estude por 3 dias consecutivos',
      icon: 'fire',
      unlocked: false,
      points: 15
    },
    {
      id: 'streak_7',
      name: 'Semana de Estudos',
      description: 'Estude por 7 dias consecutivos',
      icon: 'calendar-week',
      unlocked: false,
      points: 50
    },
    {
      id: 'perfect_quiz',
      name: 'Perfeição',
      description: 'Acertar 100% em um quiz',
      icon: 'star',
      unlocked: false,
      points: 20
    },
    {
      id: 'level_virtuoso',
      name: 'Virtuoso',
      description: 'Alcance o nível Virtuoso',
      icon: 'medal',
      unlocked: false,
      points: 100
    },
    {
      id: 'level_maestro',
      name: 'Maestro',
      description: 'Alcance o nível Maestro',
      icon: 'crown',
      unlocked: false,
      points: 200
    },
    {
      id: 'weekly_goal',
      name: 'Meta Semanal',
      description: 'Complete sua meta semanal',
      icon: 'target',
      unlocked: false,
      points: 30
    }
  ];

  // Desafios disponíveis
  private static challenges: Challenge[] = [
    {
      id: 'daily_quiz',
      name: 'Quiz Diário',
      description: 'Complete um quiz hoje',
      type: 'daily',
      completed: false,
      points: GAMIFICATION_RULES.POINTS.DAILY_CHALLENGE,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'weekly_modules',
      name: 'Módulos da Semana',
      description: 'Complete 3 módulos esta semana',
      type: 'weekly',
      completed: false,
      points: 75,
      progress: 0,
      maxProgress: 3
    },
    {
      id: 'monthly_streak',
      name: 'Sequência Mensal',
      description: 'Mantenha uma sequência de 15 dias',
      type: 'monthly',
      completed: false,
      points: 150,
      progress: 0,
      maxProgress: 15
    }
  ];

  // Verificar conquistas desbloqueadas
  static checkAchievements(userStats: any): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return; // Já desbloqueada
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_quiz':
          shouldUnlock = userStats.totalQuizzes > 0;
          break;
        case 'first_module':
          shouldUnlock = userStats.completedModules > 0;
          break;
        case 'streak_3':
          shouldUnlock = userStats.currentStreak >= 3;
          break;
        case 'streak_7':
          shouldUnlock = userStats.currentStreak >= 7;
          break;
        case 'perfect_quiz':
          shouldUnlock = userStats.averageScorePercentage >= 100;
          break;
        case 'level_virtuoso':
          shouldUnlock = userStats.level === 'virtuoso';
          break;
        case 'level_maestro':
          shouldUnlock = userStats.level === 'maestro';
          break;
        case 'weekly_goal':
          shouldUnlock = userStats.weeklyProgress >= userStats.weeklyGoal;
          break;
      }
      
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
      }
    });
    
    return unlockedAchievements;
  }

  // Verificar desafios completados
  static checkChallenges(userStats: any): Challenge[] {
    const completedChallenges: Challenge[] = [];
    
    this.challenges.forEach(challenge => {
      if (challenge.completed) return; // Já completado
      
      let shouldComplete = false;
      
      switch (challenge.id) {
        case 'daily_quiz':
          challenge.progress = userStats.quizzesLast7Days > 0 ? 1 : 0;
          shouldComplete = challenge.progress >= challenge.maxProgress;
          break;
        case 'weekly_modules':
          challenge.progress = Math.min(userStats.completedModules, 3);
          shouldComplete = challenge.progress >= challenge.maxProgress;
          break;
        case 'monthly_streak':
          challenge.progress = Math.min(userStats.currentStreak, 15);
          shouldComplete = challenge.progress >= challenge.maxProgress;
          break;
      }
      
      if (shouldComplete) {
        challenge.completed = true;
        challenge.completedAt = new Date();
        completedChallenges.push(challenge);
      }
    });
    
    return completedChallenges;
  }

  // Obter todas as conquistas
  static getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Obter todas as conquistas desbloqueadas
  static getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  // Obter todas as conquistas bloqueadas
  static getLockedAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.unlocked);
  }

  // Obter todos os desafios
  static getAllChallenges(): Challenge[] {
    return [...this.challenges];
  }

  // Obter desafios ativos (não completados)
  static getActiveChallenges(): Challenge[] {
    return this.challenges.filter(c => !c.completed);
  }

  // Obter desafios completados
  static getCompletedChallenges(): Challenge[] {
    return this.challenges.filter(c => c.completed);
  }

  // Calcular pontos totais de conquistas
  static getTotalAchievementPoints(): number {
    return this.getUnlockedAchievements().reduce((total, achievement) => total + achievement.points, 0);
  }

  // Calcular pontos totais de desafios
  static getTotalChallengePoints(): number {
    return this.getCompletedChallenges().reduce((total, challenge) => total + challenge.points, 0);
  }

  // Resetar desafios diários
  static resetDailyChallenges(): void {
    this.challenges
      .filter(c => c.type === 'daily')
      .forEach(challenge => {
        challenge.completed = false;
        challenge.progress = 0;
        challenge.completedAt = undefined;
      });
  }

  // Resetar desafios semanais
  static resetWeeklyChallenges(): void {
    this.challenges
      .filter(c => c.type === 'weekly')
      .forEach(challenge => {
        challenge.completed = false;
        challenge.progress = 0;
        challenge.completedAt = undefined;
      });
  }

  // Resetar desafios mensais
  static resetMonthlyChallenges(): void {
    this.challenges
      .filter(c => c.type === 'monthly')
      .forEach(challenge => {
        challenge.completed = false;
        challenge.progress = 0;
        challenge.completedAt = undefined;
      });
  }
}




