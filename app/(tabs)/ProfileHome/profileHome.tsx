import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import MenuBottom from '../Components/MenuBottom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStats } from '../../types/UserStats';

// ✅ INTERFACE PARA CONTROLE DE DESAFIO DIÁRIO
interface DailyChallengeStatus {
  completed: boolean;
  completedAt: string | null;
  nextAvailableAt: string | null;
  canPlay: boolean;
  timeRemaining: string;
}


const { width } = Dimensions.get('window');
const CARD_MAX_WIDTH = 120;

function getGreeting(userStats: UserStats | any): string {
  const hour = new Date().getHours();
  const streak = userStats?.streak || 0;
  if (streak >= 7) return 'Parabéns pela sequência!';
  if (hour < 12) return 'Bom dia,';
  if (hour < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function getLevelBadge(level: string): { color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap } {
  const levels: Record<string, { color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
    'Aprendiz': { color: '#4CAF50', icon: 'school' },
    'Virtuoso': { color: '#2196F3', icon: 'star' },
    'Maestro': { color: '#FF8C00', icon: 'crown' },
  };
  return levels[level] || levels['Aprendiz'];
}

interface ProfileHomeProps {
  navigation: NavigationProp<any>;
}

export default function ProfileHome({ navigation }: ProfileHomeProps) {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState<any>(null);
  const [dailyChallengeStatus, setDailyChallengeStatus] = useState<DailyChallengeStatus>({
    completed: false,
    completedAt: null,
    nextAvailableAt: null,
    canPlay: true,
    timeRemaining: ''
  });

  useEffect(() => {
    loadUserData();
    loadDailyChallengeStatus();
  }, [user]); // Recarregar quando o usuário mudar

  // Atualizar dados quando a tela receber foco (com throttling)
  useEffect(() => {
    let lastFocusTime = 0;
    const FOCUS_THROTTLE = 30000; // 30 segundos

    const unsubscribe = navigation.addListener('focus', () => {
      const now = Date.now();
      if (now - lastFocusTime > FOCUS_THROTTLE) {
        console.log('🔄 Tela inicial recebeu foco, atualizando dados...');
        loadUserData();
        loadDailyChallengeStatus();
        lastFocusTime = now;
      } else {
        console.log('⏰ Throttling: atualização muito recente, pulando...');
      }
    });

    return unsubscribe;
  }, [navigation]); // Removido loadUserData e loadDailyChallengeStatus das dependências

  // ✅ TIMER AUTOMÁTICO: Verificar a cada minuto se o desafio deve ser desbloqueado
  useEffect(() => {
    const interval = setInterval(() => {
      // Verificar se há um desafio completado e se já passou 24h
      if (dailyChallengeStatus.completed && dailyChallengeStatus.completedAt) {
        const now = new Date();
        const completedAt = new Date(dailyChallengeStatus.completedAt);
        const nextAvailable = new Date(completedAt.getTime() + (24 * 60 * 60 * 1000));
        
        if (now >= nextAvailable) {
          console.log('🕐 24h passaram! Desbloqueando desafio diário...');
          loadDailyChallengeStatus(); // Recarregar status para desbloquear
        }
      }
    }, 60000); // Verificar a cada 1 minuto

    return () => clearInterval(interval);
  }, [dailyChallengeStatus.completed, dailyChallengeStatus.completedAt]);

  // ✅ FUNÇÃO PARA CARREGAR STATUS DO DESAFIO DIÁRIO
  const loadDailyChallengeStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('@NoteMusic:dailyChallenge');
      if (stored) {
        const status = JSON.parse(stored);
        const now = new Date();
        const completedAt = status.completedAt ? new Date(status.completedAt) : null;
        
        if (completedAt) {
          const nextAvailable = new Date(completedAt.getTime() + (24 * 60 * 60 * 1000)); // +24h
          const canPlay = now >= nextAvailable;
          const timeRemaining = canPlay ? '' : formatTimeRemaining(nextAvailable, now);
          
          // ✅ CORREÇÃO: Se já passou 24h, resetar o status para permitir novo desafio
          if (canPlay) {
            // Resetar o status para permitir novo desafio
            const resetStatus = {
              completed: false,
              completedAt: null,
              nextAvailableAt: null,
              canPlay: true,
              timeRemaining: ''
            };
            
            // Salvar o status resetado
            await AsyncStorage.setItem('@NoteMusic:dailyChallenge', JSON.stringify(resetStatus));
            
            setDailyChallengeStatus(resetStatus);
          } else {
            // Ainda dentro do período de 24h, manter bloqueado
            setDailyChallengeStatus({
              completed: true,
              completedAt: status.completedAt,
              nextAvailableAt: nextAvailable.toISOString(),
              canPlay: false,
              timeRemaining
            });
          }
        } else {
          // Primeira vez ou sem dados, permitir jogar
          setDailyChallengeStatus({
            completed: false,
            completedAt: null,
            nextAvailableAt: null,
            canPlay: true,
            timeRemaining: ''
          });
        }
      } else {
        // Primeira vez, permitir jogar
        setDailyChallengeStatus({
          completed: false,
          completedAt: null,
          nextAvailableAt: null,
          canPlay: true,
          timeRemaining: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar status do desafio diário:', error);
      // Em caso de erro, permitir jogar por segurança
      setDailyChallengeStatus({
        completed: false,
        completedAt: null,
        nextAvailableAt: null,
        canPlay: true,
        timeRemaining: ''
      });
    }
  };

  // ✅ FUNÇÃO PARA FORMATAR TEMPO RESTANTE
  const formatTimeRemaining = (nextAvailable: Date, now: Date): string => {
    const diff = nextAvailable.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // ✅ FUNÇÃO PARA MARCAR DESAFIO COMO COMPLETO
  const markDailyChallengeCompleted = async () => {
    try {
      const now = new Date();
      const nextAvailable = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // +24h
      
      const status = {
        completed: true,
        completedAt: now.toISOString(),
        nextAvailableAt: nextAvailable.toISOString(),
        canPlay: false,
        timeRemaining: '24h'
      };
      
      await AsyncStorage.setItem('@NoteMusic:dailyChallenge', JSON.stringify(status));
      setDailyChallengeStatus(status);
      
      console.log('✅ Desafio diário marcado como completo. Próximo disponível em:', nextAvailable.toISOString());
    } catch (error) {
      console.error('Erro ao marcar desafio como completo:', error);
    }
  };

  const loadUserData = async () => {
    console.log('🔍 Iniciando loadUserData...');
    console.log('👤 Usuário atual:', user);
    
    try {
      setIsLoading(true);
      
      // Dados mock padrão para todos os casos
      const defaultStats = {
        level: 'Aprendiz',
        progress: 0,
        streak: 0,
        achievements: [],
        challenges: [],
        totalModules: 16,
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
          current: 'Aprendiz',
          next: 'Virtuoso',
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

      // Se não há usuário, usar dados padrão
      if (!user) {
        console.log('📱 Usuário não autenticado, usando dados padrão');
        setUserStats(defaultStats);
        return;
      }

      // Se há usuário, tentar buscar dados reais
      console.log('🔐 Usuário autenticado, buscando dados reais...');
      try {
        const stats = await apiService.getUserStats();
        console.log('✅ Estatísticas carregadas do backend:', stats);
        setUserStats(stats);
      } catch (apiError) {
        console.error('❌ Erro ao carregar estatísticas, usando dados padrão:', apiError);
        // Usar dados padrão com informações do usuário
        setUserStats({
          ...defaultStats,
          level: user.level || 'Aprendiz'
        });
      }
    } catch (error) {
      console.error('💥 Erro geral ao carregar dados do usuário:', error);
      // Em caso de erro geral, usar dados padrão
      setUserStats({
        level: 'Aprendiz',
        progress: 0,
        streak: 0,
        achievements: [],
        challenges: [],
        totalModules: 16,
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
          current: 'Aprendiz',
          next: 'Virtuoso',
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
      });
    } finally {
      // Carregar progresso de módulos
      await loadModuleProgress();
      
      console.log('🏁 Finalizando loadUserData');
      setIsLoading(false);
    }
  };

  const loadModuleProgress = async () => {
    try {
      if (user) {
        const progress = await apiService.getModuleProgress();
        console.log('📚 Progresso de módulos carregado:', progress);
        setModuleProgress(progress);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar progresso de módulos:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando dados...</Text>
      </View>
    );
  }

  if (!userStats) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center', padding: 20 }}>
          {user ? 'Carregando dados do usuário...' : 'Faça login para ver suas estatísticas'}
        </Text>
        {!user && (
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#007AFF', 
              paddingHorizontal: 20, 
              paddingVertical: 10, 
              borderRadius: 8,
              marginTop: 10
            }}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fazer Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Garantir valores seguros
  const safeUserStats = {
    level: userStats?.level || 'Aprendiz',
    streak: userStats?.streak || 0,
    completedModules: userStats?.completedModules || 0,
    totalModules: userStats?.totalModules || 12,
    weeklyProgress: userStats?.weeklyProgress || 0,
    weeklyGoal: userStats?.weeklyGoal || 5,
    nextAchievement: userStats?.nextAchievement || 'Complete seu primeiro módulo'
  };

  const levelBadge = getLevelBadge(safeUserStats.level);
  const greeting = getGreeting(safeUserStats);

  const stats = [
    {
      label: 'Sequência Ativa',
      value: `${safeUserStats.streak} dias`,
      icon: 'fire' as keyof typeof MaterialCommunityIcons.glyphMap,
      description: 'Dias seguidos de estudo',
      color: '#FF9800',
    },
    {
      label: 'Conclusão de Módulos Completados',
      value: moduleProgress ? moduleProgress.progress : '0/0',
      icon: 'check-circle' as keyof typeof MaterialCommunityIcons.glyphMap,
      description: moduleProgress && moduleProgress.message ? 
        'Nível Máximo Atingido!' : 
        `Nível ${moduleProgress ? moduleProgress.level : 'Aprendiz'}`,
      color: moduleProgress && moduleProgress.message ? '#FF6B35' : '#1976D2',
    },
    {
      label: 'Semana Atual',
      value: `${safeUserStats.weeklyProgress}/${safeUserStats.weeklyGoal}`,
      icon: 'calendar-week' as keyof typeof MaterialCommunityIcons.glyphMap,
      description: 'Meta semanal atingida',
      color: '#43A047',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Topo: Badge de nível, Saudação, Nome, Progresso */}
        <View style={styles.userHeader}>
          <TouchableOpacity 
            style={[styles.levelBadge, { backgroundColor: levelBadge.color }]}
            onPress={() => navigation.navigate('LevelStats')}
            activeOpacity={0.8}
          > 
            <MaterialCommunityIcons name={levelBadge.icon} size={22} color="#FFF" />
            <Text style={styles.levelBadgeText}>{safeUserStats.level}</Text>
          </TouchableOpacity>
          <View style={styles.userTextBlock}>
            <Text style={styles.greeting}>
              {greeting} <Text style={styles.username}>{user?.name || "Usuário"}</Text>
            </Text>
          </View>
        </View>

        {/* Cards de evolução */}
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { shadowColor: stat.color }]}> 
              <MaterialCommunityIcons name={stat.icon} size={32} color={stat.color} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statDesc}>{stat.description}</Text>
            </View>
          ))}
        </View>



        {/* Contexto acima do botão de categorias */}
        <Text style={styles.categoryContext}>
          Explore todas as categorias musicais disponíveis e continue sua jornada de aprendizado!
        </Text>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => navigation.navigate('ModuleCategory')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="apps" size={22} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.categoryButtonText}>Explorar Categorias</Text>
        </TouchableOpacity>

        {/* Card de Desafio Diário */}
        <View style={styles.dailyChallengeCard}>
          <View style={styles.dailyChallengeHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF8C00" />
            <Text style={styles.dailyChallengeTitle}>Desafio do Dia</Text>
          </View>
          
          <Text style={styles.dailyChallengeDesc}>
            {!dailyChallengeStatus.canPlay 
              ? 'Você já completou o desafio de hoje! Volte em 24 horas para um novo desafio.'
              : 'Teste seus conhecimentos com questões especiais e ganhe pontos bônus para acelerar seu progresso!'
            }
          </Text>
          
          <View style={styles.dailyChallengeInfo}>
            <View style={styles.dailyChallengeInfoItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.dailyChallengeInfoText}>10 minutos</Text>
            </View>
            <View style={styles.dailyChallengeInfoItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={16} color="#666" />
              <Text style={styles.dailyChallengeInfoText}>5 questões</Text>
            </View>
            <View style={styles.dailyChallengeInfoItem}>
              <MaterialCommunityIcons name="star-outline" size={16} color="#666" />
              <Text style={styles.dailyChallengeInfoText}>+50 pontos</Text>
            </View>
          </View>
          
          {dailyChallengeStatus.completed && !dailyChallengeStatus.canPlay && (
            <View style={styles.dailyChallengeTimer}>
              <MaterialCommunityIcons name="timer-outline" size={16} color="#FF9800" />
              <Text style={styles.dailyChallengeTimerText}>
                Próximo desafio em: {dailyChallengeStatus.timeRemaining}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[
              styles.dailyChallengeButton,
              !dailyChallengeStatus.canPlay && styles.dailyChallengeButtonDisabled
            ]} 
            onPress={() => {
              if (dailyChallengeStatus.canPlay) {
                console.log('🎯 Iniciando desafio diário...');
                navigation.navigate('Quiz', { 
                  moduleId: 'daily-challenge',
                  isDailyChallenge: true,
                  onComplete: markDailyChallengeCompleted
                });
              }
            }}
            disabled={!dailyChallengeStatus.canPlay}
          >
            <Text style={[
              styles.dailyChallengeButtonText,
              !dailyChallengeStatus.canPlay && styles.dailyChallengeButtonTextDisabled
            ]}>
              {dailyChallengeStatus.canPlay ? 'Começar Agora' : 'Bloqueado'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ SEÇÃO "STATUS DA JORNADA" REMOVIDA CONFORME SOLICITADO */}
      </ScrollView>
      <MenuBottom
        current="home"
        goHome={() => {}}
        goProfile={() => navigation && navigation.navigate ? navigation.navigate('ProfileAccount') : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#F8F9FA',
    flexGrow: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 18,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 12,
    elevation: 2,
  },
  levelBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  userTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#0087D3',
    fontWeight: '600',
    marginBottom: 0,
  },
  username: {
    fontSize: 18,
    color: '#232323',
    fontWeight: 'bold',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 18,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    minHeight: 100,
  },
  statValue: {
    fontSize: 16,
    color: '#0087D3',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '600',
  },
  statDesc: {
    fontSize: 10,
    color: '#A3A3A3',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 12,
  },

  categoryContext: {
    fontSize: 15,
    color: '#232323',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0087D3',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 28,
    marginTop: 0,
    elevation: 2,
    width: '100%',
    alignSelf: 'center',
  },
  categoryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  dailyChallengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  dailyChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyChallengeTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dailyChallengeDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  dailyChallengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dailyChallengeInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  dailyChallengeInfoText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  dailyChallengeButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dailyChallengeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dailyChallengeButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  dailyChallengeButtonTextDisabled: {
    color: '#999',
  },
  dailyChallengeTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  dailyChallengeTimerText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 4,
    fontWeight: '600',
  },
  journeyStatusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#9C27B0',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 32,
  },
  journeyStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  journeyStatusTitle: {
    fontSize: 18,
    color: '#9C27B0',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  journeyStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  journeyStatusItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  journeyStatusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginTop: 4,
    marginBottom: 2,
  },
  journeyStatusLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});