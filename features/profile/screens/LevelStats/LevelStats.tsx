import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ChromeNavHeader from '@/shared/components/layout/ChromeNavHeader';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import BackButton from '@/shared/components/layout/BackButton/BackButton';
import { getLevelColors, getLevelIcon } from '@/shared/constants/theme';

interface LevelStatsProps {
  navigation: NavigationProp<any>;
}

interface LevelInfo {
  currentLevel: string;
  nextLevel: string;
  progress: {
    modules: { current: number; required: number; percentage: number };
    points: { current: number; required: number; percentage: number };
  };
  requirements: string;
  benefits: string;
  stats?: {
    totalModules: number;
    completedModules: number;
    totalQuizzes: number;
    passedQuizzes: number;
    totalTime: number;
    averageScore: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export default function LevelStats({ navigation }: LevelStatsProps) {
  const { user } = useAuth();
  const { level: themeLevel, chrome } = useLevelTheme();
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadLevelInfo();
    }, [user?.id])
  );

  const loadLevelInfo = async () => {
    try {
      setIsLoading(true);
      const stats = await apiService.getUserStats(true);
      
      console.log('📊 Dados recebidos no LevelStats:', stats);
      
      if (stats && stats.levelProgress) {
        setLevelInfo({
          currentLevel: stats.levelProgress.current,
          nextLevel: stats.levelProgress.next,
          progress: {
            modules: stats.levelProgress.modulesProgress || { current: 0, required: 0, percentage: 0 },
            points: stats.levelProgress.pointsProgress || { current: 0, required: 0, percentage: 0 }
          },
          requirements: stats.levelProgress.requirements,
          benefits: getBenefitsByLevel(stats.levelProgress.next),
          stats: {
            totalModules: getTotalModulesForLevel(stats.levelProgress.current),
            completedModules: stats.completedModules || 0,
            totalQuizzes: stats.totalQuizzes || 0,
            passedQuizzes: stats.passedQuizzes || 0,
            totalTime: stats.totalTimeMinutes || 0,
            averageScore: stats.averageScore || 0,
            currentStreak: stats.streak || 0,
            bestStreak: stats.longestStreak || 0
          }
        });
      } else {
        console.error('❌ Dados de levelProgress não encontrados:', stats);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar informações de nível:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBenefitsByLevel = (level: string): string => {
    switch (level) {
      case 'Virtuoso':
        return 'Acesso a módulos Virtuoso (intermediários) e novos desafios';
      case 'Maestro':
        return 'Acesso a todos os módulos (incluindo Maestro) e desafios especiais';
      case 'Nível Máximo':
        return 'Você conquistou o nível máximo! Continue praticando para manter suas habilidades!';
      default:
        return 'Complete 16 módulos Aprendiz para desbloquear nível Virtuoso';
    }
  };

  const getTotalModulesForLevel = (level: string): number => {
    const levelLower = level?.toLowerCase() || 'aprendiz';
    
    // Mostrar REQUISITOS para avançar (não total de módulos)
    const requirementsByLevel: Record<string, number> = {
      'aprendiz': 16,   // Precisa completar 16 para ser Virtuoso
      'virtuoso': 32,   // Precisa completar 32 total para ser Maestro
      'maestro': 42     // Já completou todos (42 módulos total)
    };
    
    return requirementsByLevel[levelLower] || 16;
  };

  const isMaxLevel = (currentLevel: string): boolean => {
    return currentLevel === 'Nível Máximo' || currentLevel === 'Maestro' || currentLevel === 'Máximo';
  };

  const getLevelIconInfo = (level: string): { icon: string; color: string } => {
    const levelColors = getLevelColors(level);
    const icon = getLevelIcon(level);
    
    return {
      icon: icon,
      color: levelColors.primary
    };
  };

  if (isLoading) {
    return (
      <LevelScreenShell level={themeLevel}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={chrome.primary} />
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      </LevelScreenShell>
    );
  }

  if (!levelInfo) {
    return (
      <LevelScreenShell level={themeLevel}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar informações</Text>
        </View>
      </LevelScreenShell>
    );
  }

  const currentLevelIcon = getLevelIconInfo(levelInfo.currentLevel);
  const nextLevelIcon = getLevelIconInfo(levelInfo.nextLevel);
  const currentLevelColors = getLevelColors(levelInfo.currentLevel);
  const nextLevelColors = getLevelColors(levelInfo.nextLevel);

  return (
    <LevelScreenShell level={themeLevel}>
      <View style={styles.container}>
      <ChromeNavHeader variant="title">
        <BackButton onPress={() => navigation.goBack()} level={themeLevel} />
        <Text style={[styles.headerTitle, { color: currentLevelColors.text }]}>Progresso de Nível</Text>
      </ChromeNavHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Nível Atual */}
        <View style={[styles.currentLevelCard, { backgroundColor: currentLevelColors.secondary, borderLeftColor: currentLevelColors.primary }]}>
          <View style={styles.levelHeader}>
            <MaterialCommunityIcons 
              name={currentLevelIcon.icon as any} 
              size={48} 
              color={currentLevelIcon.color} 
            />
            <View style={styles.levelInfo}>
              <Text style={[styles.levelLabel, { color: currentLevelColors.text }]}>Nível Atual</Text>
              <Text style={[styles.levelName, { color: currentLevelColors.primary }]}>{levelInfo.currentLevel}</Text>
            </View>
          </View>
        </View>

        {/* Progresso para Próximo Nível - Só aparece se não for nível máximo */}
        {!isMaxLevel(levelInfo.currentLevel) && (
          <View style={styles.progressCard}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="trending-up" size={24} color={nextLevelColors.primary} />
              <Text style={styles.sectionTitle}>Progresso para {levelInfo.nextLevel}</Text>
            </View>
          
          {/* Progresso de Módulos */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={currentLevelColors.primary} />
              <Text style={styles.progressLabel}>Módulos Completados</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${levelInfo.progress.modules.percentage}%`,
                    backgroundColor: nextLevelColors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {levelInfo.progress.modules.current} / {levelInfo.progress.modules.required} módulos completos
            </Text>
          </View>
        </View>
        )}

        {/* Estatísticas do Aluno */}
        {levelInfo.stats && (
          <View style={styles.statsCard}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="chart-line" size={24} color={currentLevelColors.primary} />
              <Text style={styles.sectionTitle}>Seu Desempenho</Text>
            </View>
            
            <View style={styles.statsGrid}>
              {/* Módulos */}
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="book-check" size={24} color="#43BBFF" />
                <Text style={styles.statValue}>{levelInfo.stats.completedModules}/{levelInfo.stats.totalModules}</Text>
                <Text style={styles.statLabel}>Módulos</Text>
              </View>
              
              {/* Taxa de Aprovação */}
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="certificate" size={24} color="#43BBFF" />
                <Text style={styles.statValue}>
                  {levelInfo.stats.totalQuizzes > 0 
                    ? Math.round((levelInfo.stats.passedQuizzes / levelInfo.stats.totalQuizzes) * 100)
                    : 0}%
                </Text>
                <Text style={styles.statLabel}>Taxa de Aprovação</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              {/* Sequência */}
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#43BBFF" />
                <Text style={styles.statValue}>{levelInfo.stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Dias Sequência</Text>
              </View>
              
              {/* Quiz Concluídos */}
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#43BBFF" />
                <Text style={styles.statValue}>{levelInfo.stats.passedQuizzes}</Text>
                <Text style={styles.statLabel}>Quizzes Aprovados</Text>
              </View>
            </View>
          </View>
        )}

        {/* Requisitos e Benefícios */}
        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <MaterialCommunityIcons name="school" size={24} color="#4CAF50" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Requisitos</Text>
              <Text style={styles.infoText}>{levelInfo.requirements}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <MaterialCommunityIcons name="gift" size={24} color="#FF9800" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Benefícios ao Subir</Text>
              <Text style={styles.infoText}>{levelInfo.benefits}</Text>
            </View>
          </View>
        </View>

        {/* Próximo Nível - Só aparece se não for nível máximo */}
        {!isMaxLevel(levelInfo.currentLevel) && (
          <View style={[styles.nextLevelCard, { backgroundColor: nextLevelColors.secondary, borderLeftColor: nextLevelColors.primary }]}>
            <View style={styles.nextLevelIconContainer}>
              <MaterialCommunityIcons 
                name="school" 
                size={36} 
                color={nextLevelColors.primary} 
              />
            </View>
            <View style={styles.nextLevelContent}>
              <Text style={[styles.nextLevelLabel, { color: nextLevelColors.text }]}>Próximo Nível</Text>
              <Text style={[styles.nextLevelName, { color: nextLevelColors.primary }]}>{levelInfo.nextLevel}</Text>
            </View>
          </View>
        )}

        {/* Mensagem de Nível Máximo */}
        {isMaxLevel(levelInfo.currentLevel) && (
          <View style={[styles.maxLevelCard, { backgroundColor: currentLevelColors.secondary, borderLeftColor: currentLevelColors.primary }]}>
            <MaterialCommunityIcons 
              name="trophy" 
              size={32} 
              color={currentLevelColors.primary} 
            />
            <Text style={[styles.maxLevelText, { color: currentLevelColors.text }]}>🎉 Parabéns! Você atingiu o nível máximo!</Text>
            <Text style={[styles.maxLevelSubText, { color: currentLevelColors.text }]}>Continue praticando para manter suas habilidades!</Text>
          </View>
        )}
      </ScrollView>
      </View>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  content: {
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  currentLevelCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelInfo: {
    marginLeft: 16,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  levelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#232323',
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232323',
    marginLeft: 8,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#545454',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0087D3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  nextLevelCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  nextLevelIconContainer: {
    marginRight: 16,
  },
  nextLevelContent: {
    flex: 1,
  },
  nextLevelLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  nextLevelName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8D6E63',
  },
  maxLevelCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  maxLevelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8D6E63',
    marginTop: 12,
    textAlign: 'center',
  },
  maxLevelSubText: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#232323',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
