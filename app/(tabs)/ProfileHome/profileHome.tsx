import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp } from '@react-navigation/native';
import MenuBottom from '../Components/MenuBottom';
import PrimaryButton from '../Components/Button/PrimaryButton';
import SkeletonHome from './SkeletonHome';

const user = {
  name: 'Danilo Silva',
  level: 'Intermediário',
  streak: 7,
  totalLessons: 24,
  completedLessons: 16,
  weeklyGoal: 5,
  weeklyProgress: 3,
  nextAchievement: 'Complete 2 dias seguidos para ganhar o troféu “Foco Total”!',
  avatar: '',
  nextQuiz: {
    title: 'Desafio Semanal IA',
    description: 'Pergunta personalizada gerada por IA para seu nível!',
    expiresIn: '4 dias',
    questionsCount: 10,
    level: 'Adaptativo',
  }
};

const stats = [
  {
    label: 'Sequência',
    value: `${user.streak} dias`,
    icon: 'fire',
    description: 'Dias seguidos de estudo',
    color: '#FF9800',
  },
  {
    label: 'Progresso',
    value: `${Math.round((user.completedLessons / user.totalLessons) * 100)}%`,
    icon: 'progress-check',
    description: 'Do curso concluído',
    color: '#1976D2',
  },
  {
    label: 'Meta semanal',
    value: `${user.weeklyProgress}/${user.weeklyGoal}`,
    icon: 'calendar-check',
    description: 'Aulas esta semana',
    color: '#43A047',
  },
];

const { width } = Dimensions.get('window');
const CARD_MAX_WIDTH = 150;

function getGreeting(user: any): string {
  const hour = new Date().getHours();
  if (user.streak >= 7) return 'Parabéns pela sequência!';
  if (hour < 12) return 'Bom dia,';
  if (hour < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function getLevelBadge(level: string): { color: string; icon: string } {
  const levels: Record<string, { color: string; icon: string }> = {
    'Aprendiz': { color: '#B0BEC5', icon: 'school' },
    'Intermediário': { color: '#42A5F5', icon: 'star' },
    'Virtuoso': { color: '#43A047', icon: 'music' },
    'Maestro': { color: '#FFD700', icon: 'trophy' },
  };
  return levels[level] || levels['Aprendiz'];
}

interface ProfileHomeProps {
  navigation: NavigationProp<any>;
}

export default function ProfileHome({ navigation }: ProfileHomeProps) {
  const levelBadge = getLevelBadge(user.level);
  const greeting = getGreeting(user);
  const aulasRestantes = user.totalLessons - user.completedLessons;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonHome />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Topo: Badge de nível, Saudação, Nome, Progresso */}
        <View style={styles.userHeader}>
          <View style={[styles.levelBadge, { backgroundColor: levelBadge.color }]}> 
            <MaterialCommunityIcons name={levelBadge.icon} size={22} color="#FFF" />
            <Text style={styles.levelBadgeText}>{user.level}</Text>
          </View>
          <View style={styles.userTextBlock}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.userLevelDetail}>
              {aulasRestantes > 0
                ? `Faltam ${aulasRestantes} aulas para o próximo nível!`
                : 'Você já completou todos os módulos!'}
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

        {/* Banner motivacional de conquista */}
        <View style={styles.achievementBanner}>
          <MaterialCommunityIcons name="trophy-award" size={22} color="#FFD700" style={{ marginRight: 8 }} />
          <Text style={styles.achievementText}>{user.nextAchievement}</Text>
        </View>

        {/* Contexto acima do botão de categorias */}
        <Text style={styles.categoryContext}>
          Veja todas as categorias disponíveis para você e escolha o que deseja aprender!
        </Text>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => navigation.navigate('ModuleCategory')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="apps" size={22} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.categoryButtonText}>Explorar Categorias</Text>
        </TouchableOpacity>

        {/* Card de pergunta/desafio IA */}
        <View style={styles.iaCard}>
          <Text style={styles.iaTitle}>{user.nextQuiz.title}</Text>
          <Text style={styles.iaDesc}>{user.nextQuiz.description}</Text>
          <View style={styles.iaInfoRow}>
            <View style={styles.iaInfoBox}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#0087D3" />
              <Text style={styles.iaInfoValue}>{user.nextQuiz.expiresIn}</Text>
            </View>
            <View style={styles.iaInfoBox}>
              <MaterialCommunityIcons name="help-circle-outline" size={18} color="#0087D3" />
              <Text style={styles.iaInfoValue}>{user.nextQuiz.questionsCount} perguntas</Text>
            </View>
            <View style={styles.iaInfoBox}>
              <MaterialCommunityIcons name="target" size={18} color="#0087D3" />
              <Text style={styles.iaInfoValue}>{user.nextQuiz.level}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iaButton} onPress={() => alert('Iniciar desafio IA!')}>
            <Text style={styles.iaButtonText}>Responder agora</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 16,
    color: '#0087D3',
    fontWeight: '600',
    marginBottom: 0,
  },
  username: {
    fontSize: 24,
    color: '#232323',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userLevelDetail: {
    fontSize: 12,
    color: '#0087D3',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: width < 500 ? 'wrap' : 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    gap: 12,
  },
  statCard: {
    flex: 1,
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginHorizontal: 0,
    elevation: 2,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    minWidth: 110,
  },
  statValue: {
    fontSize: 18,
    color: '#0087D3',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 2,
  },
  statDesc: {
    fontSize: 11,
    color: '#A3A3A3',
    textAlign: 'center',
    marginBottom: 0,
  },
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    marginTop: 2,
    elevation: 1,
  },
  achievementText: {
    color: '#8D6E63',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
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
  iaCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0087D3',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 32,
  },
  iaTitle: {
    fontSize: 18,
    color: '#0087D3',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  iaDesc: {
    fontSize: 15,
    color: '#232323',
    marginBottom: 12,
  },
  iaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  iaInfoBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
    minWidth: 80,
  },
  iaInfoValue: {
    fontSize: 13,
    color: '#232323',
    marginTop: 2,
    textAlign: 'center',
  },
  iaButton: {
    backgroundColor: '#0087D3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  iaButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});