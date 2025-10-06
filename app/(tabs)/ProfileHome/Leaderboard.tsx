import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../../services/api';

interface LeaderboardEntry {
  id: string;
  name: string;
  level: string;
  progress: number;
  streak: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const leaderboardData = await apiService.getLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: 'trophy', color: '#FF8C00' };
      case 2:
        return { icon: 'medal', color: '#C0C0C0' };
      case 3:
        return { icon: 'medal', color: '#CD7F32' };
      default:
        return { icon: 'numeric', color: '#666' };
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const rankInfo = getRankIcon(entry.rank);
    const isCurrentUser = entry.id === user?.id;

    return (
      <View key={entry.id} style={[
        styles.leaderboardCard,
        isCurrentUser && styles.currentUserCard
      ]}>
        <View style={styles.rankContainer}>
          <MaterialCommunityIcons 
            name={rankInfo.icon as any} 
            size={24} 
            color={rankInfo.color} 
          />
          <Text style={[styles.rankText, { color: rankInfo.color }]}>
            #{entry.rank}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            isCurrentUser && styles.currentUserName
          ]}>
            {entry.name}
          </Text>
          <Text style={styles.userLevel}>{entry.level}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
                            <MaterialCommunityIcons name="chart-line" size={16} color="#0087D3" />
            <Text style={styles.statValue}>{entry.progress}%</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
            <Text style={styles.statValue}>{entry.streak} dias</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando ranking...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🏆 Ranking</Text>
      <Text style={styles.subtitle}>
        Veja como você está se saindo em relação aos outros músicos!
      </Text>
      
      {leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0087D3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentUserCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#0087D3',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#0087D3',
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 