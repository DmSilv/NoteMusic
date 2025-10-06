import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../../services/api';
import BackButton from '../Components/BackButton/BackButton';
import { getLevelColors, getLevelIcon } from '../../../constants/LevelColors';

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
}

export default function LevelStats({ navigation }: LevelStatsProps) {
  const { user } = useAuth();
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLevelInfo();
  }, []);

  const loadLevelInfo = async () => {
    try {
      setIsLoading(true);
      const stats = await apiService.getUserStats();
      
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
          benefits: getBenefitsByLevel(stats.levelProgress.next)
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
        return 'Acesso a módulos intermediários e novos desafios';
      case 'Maestro':
        return 'Acesso a todos os módulos e desafios especiais';
      case 'Nível Máximo':
        return 'Você conquistou o nível máximo! Continue praticando para manter suas habilidades!';
      default:
        return 'Continue estudando para desbloquear novos conteúdos';
    }
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  if (!levelInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar informações</Text>
      </View>
    );
  }

  const currentLevelIcon = getLevelIconInfo(levelInfo.currentLevel);
  const nextLevelIcon = getLevelIconInfo(levelInfo.nextLevel);
  const currentLevelColors = getLevelColors(levelInfo.currentLevel);
  const nextLevelColors = getLevelColors(levelInfo.nextLevel);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Progresso de Nível</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.sectionTitle}>Progresso para {levelInfo.nextLevel}</Text>
          
          {/* Progresso de Módulos */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#0087D3" />
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
              {levelInfo.progress.modules.current} / {levelInfo.progress.modules.required} módulos
            </Text>
          </View>

          {/* Progresso de Pontos */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons name="star-circle" size={20} color="#FF8C00" />
              <Text style={styles.progressLabel}>Pontos Acumulados</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${levelInfo.progress.points.percentage}%`, 
                    backgroundColor: nextLevelColors.accent
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {levelInfo.progress.points.current} / {levelInfo.progress.points.required} pontos
            </Text>
          </View>
        </View>
        )}

        {/* Requisitos e Benefícios */}
        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#4CAF50" />
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
            <MaterialCommunityIcons 
              name={nextLevelIcon.icon as any} 
              size={32} 
              color={nextLevelIcon.color} 
            />
            <Text style={[styles.nextLevelText, { color: nextLevelColors.text }]}>Próximo: {levelInfo.nextLevel}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232323',
    marginLeft: 20,
  },
  content: {
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 20,
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  nextLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8D6E63',
    marginLeft: 12,
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
});
