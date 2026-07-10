import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, BackHandler, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import MenuBottom, { getMenuBottomHeight } from '@/shared/components/layout/MenuBottom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LevelTopBar from '@/shared/components/layout/LevelTopBar';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import moduleService from '@/services/moduleService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStats } from '@/shared/types/UserStats';
import { getLevelColors } from '@/shared/constants/theme';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';

// ✅ INTERFACE PARA CONTROLE DE DESAFIO DIÁRIO
interface DailyChallengeStatus {
  completed: boolean;
  completedAt: string | null;
  nextAvailableAt: string | null;
  canPlay: boolean;
  timeRemaining: string;
}


function getGreeting(userStats: UserStats | any): string {
  const hour = new Date().getHours();
  const streak = userStats?.streak || 0;
  if (streak >= 7) return 'Parabéns pela sequência!';
  if (hour >= 5 && hour < 12) return 'Bom dia,';
  if (hour >= 12 && hour < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function getLevelBadge(level: string): { color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap } {
  // ✅ Usar getLevelColors para manter consistência com a tela de categorias
  const levelColors = getLevelColors(level);
  return {
    color: levelColors.primary,
    icon: 'school' // Todos os níveis usam o ícone de estudante (chapéu de formatura)
  };
}

// ✅ FUNÇÃO PARA CALCULAR STATUS DA SEQUÊNCIA (STREAK)
function getStreakStatus(userStats: UserStats | null, accentColor: string) {
  const currentStreak = userStats?.currentStreak || userStats?.streak || 0;
  const lastStudyDate = userStats?.recentActivity?.lastStudyDate;
  
  // Verificar se estudou hoje
  const today = new Date().toDateString();
  const lastStudy = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
  const studiedToday = lastStudy === today;
  
  let description = 'Dias consecutivos';
  let icon: keyof typeof MaterialCommunityIcons.glyphMap = 'fire';
  
  if (currentStreak === 0) {
    description = 'Comece hoje!';
  } else if (studiedToday) {
    description = '✅ Ativo hoje';
  } else {
    description = 'Dias seguidos';
  }
  
  return {
    value: `${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`,
    icon,
    description,
    color: accentColor
  };
}

// ✅ FUNÇÃO PARA CALCULAR STATUS DOS MÓDULOS COMPLETOS (requisitos para avançar)
function getModulesStatus(userStats: UserStats | null, accentColor: string) {
  const completedModules = userStats?.completedModules || 0;
  const userLevel = userStats?.level?.toLowerCase() || 'aprendiz';
  const icon: keyof typeof MaterialCommunityIcons.glyphMap = 'book-check';
  
  // Definir REQUISITOS para avançar (não o total de módulos)
  const requirementsByLevel: Record<string, number> = {
    'aprendiz': 16,   // Precisa completar 16 para ser Virtuoso
    'virtuoso': 32,   // Precisa completar 32 total para ser Maestro
    'maestro': 42     // Já completou todos (42 módulos total)
  };
  
  const requiredModules = requirementsByLevel[userLevel] || 16;
  
  let description = 'Módulos completos';
  
  if (completedModules >= requiredModules) {
    description = '🎉 Nível completo!';
  } else if (completedModules >= requiredModules * 0.8) {
    description = 'Quase lá!';
  } else if (completedModules >= requiredModules * 0.5) {
    description = 'Muito bem!';
  } else if (completedModules >= requiredModules * 0.25) {
    description = 'Progredindo';
  } else if (completedModules > 0) {
    description = 'Continue assim';
  } else {
    description = 'Complete módulos';
  }
  
  return {
    value: `${completedModules}/${requiredModules}`,
    icon,
    description,
    color: accentColor
  };
}

// ✅ FUNÇÃO PARA CALCULAR TAXA DE APROVAÇÃO
function getPassRateStatus(userStats: UserStats | null, accentColor: string) {
  const passRate = userStats?.quizPassRate || 0;
  const icon: keyof typeof MaterialCommunityIcons.glyphMap = 'chart-line';
  
  let description = 'Taxa de aprovação';
  
  if (passRate >= 90) {
    description = 'Excelente!';
  } else if (passRate >= 70) {
    description = 'Muito bom';
  } else if (passRate >= 50) {
    description = 'Continue!';
  } else if (passRate > 0) {
    description = 'Pratique mais';
  } else {
    description = 'Faça quizzes';
  }
  
  return {
    value: `${Math.round(passRate)}%`,
    icon,
    description,
    color: accentColor
  };
}

interface ProfileHomeProps {
  navigation: NavigationProp<any>;
}

export default function ProfileHome({ navigation }: ProfileHomeProps) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { isCompact, horizontalPadding, isCompactHeight } = useResponsiveLayout();
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
  
  // Animação sutil para o badge de nível
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animação de pulse contínua
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!user?.id) {
      setUserStats(null);
      setModuleProgress(null);
      setIsLoading(false);
      return;
    }

    setUserStats(null);
    setModuleProgress(null);
    setIsLoading(true);
    setDailyChallengeStatus({
      completed: false,
      completedAt: null,
      nextAvailableAt: null,
      canPlay: true,
      timeRemaining: '',
    });

    loadUserData();
    loadDailyChallengeStatus();
  }, [user?.id]);

  // ✅ Estado para rastrear se a tela está focada
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // ✅ Listener para rastrear quando a tela recebe/perde foco
  useEffect(() => {
    setIsScreenFocused(true); // Assume focado ao montar
    
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsScreenFocused(true);
      
      // ✅ Limpar stack de navegação quando a tela recebe foco
      // Isso remove todas as telas anteriores da memória e evita voltar para elas
      try {
        const navigationState = navigation.getState();
        const currentRoute = navigationState?.routes?.[navigationState.index];
        
        // Se a tela atual é ProfileHome e há telas anteriores na stack, limpar
        if (currentRoute?.name === 'ProfileHome' && navigationState.routes.length > 1) {
          console.log('🧹 Limpando stack de navegação - removendo telas anteriores da memória');
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileHome' }],
          });
        }
      } catch (error) {
        // Se houver erro ao acessar o estado, não fazer nada (não quebrar o app)
        console.log('⚠️ Não foi possível limpar stack:', error);
      }
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsScreenFocused(false);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  // ✅ BackHandler na tela Home - Avisar antes de sair do app APENAS quando focada e sem histórico
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // ✅ Se a tela não está focada, permite navegação padrão (outra tela vai tratar)
      if (!isScreenFocused) {
        return false; // Permite navegação padrão
      }
      
      // ✅ Verificar se há telas anteriores no histórico
      // Se houver histórico, permite voltar normalmente
      try {
        const canGoBack = navigation.canGoBack();
        if (canGoBack) {
          return false; // Permite navegação padrão (voltar para tela anterior)
        }
      } catch (error) {
        // Se não conseguir verificar, assume que pode voltar (seguro)
        return false;
      }
      
      // ✅ Só pergunta se quer sair quando está na Home focada e não há mais para onde voltar
      Alert.alert(
        'Sair do NoteMusic?',
        'Deseja realmente sair do aplicativo?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => null
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => BackHandler.exitApp()
          }
        ],
        { cancelable: true }
      );
      return true; // Previne comportamento padrão (sair imediatamente)
    });

    return () => backHandler.remove();
  }, [navigation, isScreenFocused]);

  // Recarregar progresso sempre que a Home receber foco (fonte: backend)
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        return;
      }

      const routeParams = navigation.getState()?.routes?.find((r) => r.name === 'ProfileHome')?.params as
        | { forceRefresh?: boolean }
        | undefined;
      const forceRefresh = routeParams?.forceRefresh === true;

      console.log('🔄 [ProfileHome] Foco — recarregando progresso', forceRefresh ? '(forçado)' : '');
      loadUserData(forceRefresh);
      loadDailyChallengeStatus();

      if (forceRefresh) {
        navigation.setParams({ forceRefresh: undefined });
      }
    }, [user?.id, navigation])
  );

  // ✅ TIMER AUTOMÁTICO: Verificar a cada minuto se é um novo dia (meia-noite passou)
  useEffect(() => {
    const interval = setInterval(() => {
      if (dailyChallengeStatus.completed && dailyChallengeStatus.completedAt) {
        const now = new Date();
        const todayStart = getTodayStart();
        const completedAt = new Date(dailyChallengeStatus.completedAt);
        const completedDate = new Date(completedAt.getFullYear(), completedAt.getMonth(), completedAt.getDate());
        
        // Se mudou de dia, desbloquear
        if (completedDate.getTime() !== todayStart.getTime()) {
          console.log('🌅 Novo dia! Desbloqueando desafio diário...');
          loadDailyChallengeStatus(); // Recarregar status para desbloquear
        }
      }
    }, 60000); // Verificar a cada 1 minuto

    return () => clearInterval(interval);
  }, [dailyChallengeStatus.completed, dailyChallengeStatus.completedAt]);

  // ✅ FUNÇÃO PARA OBTER INÍCIO DO DIA ATUAL (meia-noite)
  const getTodayStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  };

  // ✅ FUNÇÃO PARA OBTER INÍCIO DO PRÓXIMO DIA (próxima meia-noite)
  const getTomorrowStart = (): Date => {
    const today = getTodayStart();
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  };

  // ✅ FUNÇÃO PARA CARREGAR STATUS DO DESAFIO DIÁRIO (baseado no DIA, não em 24h)
  const loadDailyChallengeStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('@NoteMusic:dailyChallenge');
      const now = new Date();
      const todayStart = getTodayStart();
      
      if (stored) {
        const status = JSON.parse(stored);
        const completedAt = status.completedAt ? new Date(status.completedAt) : null;
        
        if (completedAt) {
          // ✅ VERIFICAR SE FOI COMPLETADO HOJE (comparando apenas a DATA, não hora)
          const completedDate = new Date(completedAt.getFullYear(), completedAt.getMonth(), completedAt.getDate());
          const isCompletedToday = completedDate.getTime() === todayStart.getTime();
          
          if (isCompletedToday) {
            // Completado hoje - bloquear até amanhã
            const nextAvailable = getTomorrowStart();
            const timeRemaining = formatTimeRemaining(nextAvailable, now);
            
            setDailyChallengeStatus({
              completed: true,
              completedAt: status.completedAt,
              nextAvailableAt: nextAvailable.toISOString(),
              canPlay: false,
              timeRemaining
            });
          } else {
            // Completado em outro dia - resetar para permitir novo desafio
            const resetStatus = {
              completed: false,
              completedAt: null,
              nextAvailableAt: null,
              canPlay: true,
              timeRemaining: ''
            };
            
            await AsyncStorage.setItem('@NoteMusic:dailyChallenge', JSON.stringify(resetStatus));
            setDailyChallengeStatus(resetStatus);
          }
        } else {
          // Sem data de conclusão - permitir jogar
          setDailyChallengeStatus({
            completed: false,
            completedAt: null,
            nextAvailableAt: null,
            canPlay: true,
            timeRemaining: ''
          });
        }
      } else {
        // Primeira vez - permitir jogar
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

  // ✅ FUNÇÃO PARA MARCAR DESAFIO COMO COMPLETO (bloqueado até próxima meia-noite)
  const markDailyChallengeCompleted = async () => {
    try {
      const now = new Date();
      const nextAvailable = getTomorrowStart(); // Próxima meia-noite
      const timeRemaining = formatTimeRemaining(nextAvailable, now);
      
      const status = {
        completed: true,
        completedAt: now.toISOString(),
        nextAvailableAt: nextAvailable.toISOString(),
        canPlay: false,
        timeRemaining
      };
      
      await AsyncStorage.setItem('@NoteMusic:dailyChallenge', JSON.stringify(status));
      setDailyChallengeStatus(status);
      
      console.log('✅ Desafio diário completo! Próximo disponível à meia-noite:', nextAvailable.toISOString());
    } catch (error) {
      console.error('Erro ao marcar desafio como completo:', error);
    }
  };

  const loadUserData = async (forceRefresh = false) => {
    console.log('🔍 Iniciando loadUserData...', forceRefresh ? '(forçado)' : '');
    console.log('👤 Usuário atual:', user?.id);
    
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
        const stats = await apiService.getUserStats(forceRefresh);
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
      if (user && user.id) {
        const progress = await moduleService.getModuleProgress(user.id);
        console.log('📚 Progresso de módulos carregado:', progress);
        setModuleProgress(progress);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar progresso de módulos:', error);
    }
  };

  const { chrome } = useLevelTheme(user?.level ?? userStats?.level);
  const displayLevel = userStats?.level ?? user?.level;

  if (isLoading || (user && !userStats)) {
    return (
      <View style={{ flex: 1, backgroundColor: chrome.primary }}>
        <LevelTopBar level={displayLevel} />
        <View style={{ flex: 1, backgroundColor: chrome.screenContentBackground, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={chrome.primary} />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando dados...</Text>
        </View>
      </View>
    );
  }

  if (!userStats) {
    return (
      <View style={{ flex: 1, backgroundColor: chrome.primary }}>
        <LevelTopBar level={displayLevel} />
        <View style={{ flex: 1, backgroundColor: chrome.screenContentBackground, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center', padding: 20 }}>
          Faça login para ver suas estatísticas
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: chrome.primary, 
            paddingHorizontal: 20, 
            paddingVertical: 10, 
            borderRadius: 8,
            marginTop: 10
          }}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fazer Login</Text>
        </TouchableOpacity>
        </View>
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

  // ✅ CÁLCULOS INTELIGENTES PARA OS CARDS
  const streakStatus = getStreakStatus(userStats, chrome.primary);
  const modulesStatus = getModulesStatus(userStats, chrome.primary);
  const passRateStatus = getPassRateStatus(userStats, chrome.primary);

  const stats = [
    {
      label: 'Sequência Ativa',
      value: streakStatus.value,
      icon: streakStatus.icon,
      description: streakStatus.description,
      color: streakStatus.color,
    },
    {
      label: 'Módulos Completos',
      value: modulesStatus.value,
      icon: modulesStatus.icon,
      description: modulesStatus.description,
      color: modulesStatus.color,
    },
    {
      label: 'Taxa de Sucesso',
      value: passRateStatus.value,
      icon: passRateStatus.icon,
      description: passRateStatus.description,
      color: passRateStatus.color,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: chrome.primary }}>
      <LevelTopBar level={safeUserStats.level} />
      <ScrollView 
        style={{ flex: 1, backgroundColor: chrome.screenContentBackground }}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isCompactHeight ? 24 : 40,
            paddingBottom: getMenuBottomHeight(insets.bottom),
          },
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Topo: Badge de nível, Saudação, Nome, Progresso */}
        <View style={styles.userHeader}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }]
            }}
          >
            <TouchableOpacity 
              style={[styles.levelBadge, { backgroundColor: levelBadge.color }]}
              onPress={() => navigation.navigate('LevelStats')}
              activeOpacity={0.8}
            > 
              <MaterialCommunityIcons name={levelBadge.icon} size={22} color="#FFF" />
              <Text style={styles.levelBadgeText}>{safeUserStats.level}</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.userTextBlock}>
            <Text
              style={[styles.greeting, { color: chrome.primary }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {greeting}{' '}
              <Text style={styles.username}>{user?.name || 'Usuário'}</Text>
            </Text>
          </View>
        </View>

        {/* Cards de evolução */}
        <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, isCompact && styles.statCardCompact, { borderTopColor: stat.color }]}> 
              <MaterialCommunityIcons name={stat.icon} size={isCompact ? 26 : 32} color={stat.color} style={{ marginBottom: isCompact ? 4 : 8 }} />
              <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>{stat.value}</Text>
              <Text style={[styles.statLabel, isCompact && styles.statLabelCompact]}>{stat.label}</Text>
              <Text style={[styles.statDesc, isCompact && styles.statDescCompact]}>{stat.description}</Text>
            </View>
          ))}
        </View>



        {/* Contexto acima do botão de categorias */}
        <Text style={styles.categoryContext}>
          Explore todas as categorias musicais disponíveis e continue sua jornada de aprendizado!
        </Text>
        <TouchableOpacity
          style={[styles.categoryButton, { backgroundColor: chrome.primary }]}
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
              ? 'Você já completou o desafio de hoje! Volte amanhã para um novo desafio.'
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
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#666" />
              <Text style={styles.dailyChallengeInfoText}>Desafio Único</Text>
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
        level={safeUserStats.level ?? user?.level}
        goHome={() => {}}
        goProfile={() => navigation && navigation.navigate ? navigation.navigate('ProfileAccount') : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexShrink: 0,
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
    minWidth: 0,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 0,
    flexShrink: 1,
  },
  username: {
    fontSize: 18,
    color: '#232323',
    fontWeight: 'bold',
    flexShrink: 1,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 18,
    gap: 8,
  },
  statsRowCompact: {
    gap: 6,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderTopWidth: 3,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    minHeight: 120,
  },
  statCardCompact: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 108,
  },
  statValue: {
    fontSize: 20,
    color: '#0087D3',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValueCompact: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  statLabelCompact: {
    fontSize: 10,
  },
  statDesc: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 14,
    fontWeight: '500',
  },
  statDescCompact: {
    fontSize: 10,
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
    color: '#FFF', // ✅ Texto branco para contraste perfeito com fundo laranja
    fontWeight: 'bold',
    fontSize: 16,
  },
  dailyChallengeButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  dailyChallengeButtonTextDisabled: {
    color: '#999', // Mantém cinza quando desabilitado
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