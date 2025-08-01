import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => size * (width / 375);
const vScale = (size: number) => size * (height / 812);

interface ChallengeCardProps {
  title: string;
  description: string;
  questionsCount: number;
  level: string;
  expiresIn: string;
  onStart: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description, questionsCount, level, expiresIn, onStart }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={require('../../../assets/images/clock.png')} style={styles.icon} />
        <Text style={styles.expiresIn}>Encerra em {expiresIn}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Perguntas</Text>
          <Text style={styles.infoValue}>{questionsCount}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nível</Text>
          <Text style={styles.infoValue}>{level}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Iniciar desafio semanal">
        <Text style={styles.buttonText}>Iniciar Desafio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0, 162, 255, 0.09)',
    padding: vScale(20),
    marginBottom: vScale(24),

  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vScale(8),
  },
  icon: {
    width: scale(18),
    height: scale(18),
    marginRight: scale(8),
    tintColor: '#0087D3',
  },
  expiresIn: {
    color: '#0087D3',
    fontSize: scale(13),
    fontWeight: '600',
  },
  title: {
    color: '#232323',
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: vScale(6),
  },
  description: {
    color: '#545454',
    fontSize: scale(15),
    marginBottom: vScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vScale(16),
  },
  infoBox: {
    backgroundColor: '#C6E8FF',
    borderRadius: scale(10),
    paddingVertical: vScale(8),
    paddingHorizontal: scale(16),
    alignItems: 'center',
    minWidth: scale(80),
  },
  infoLabel: {
    color: '#0087D3',
    fontSize: scale(12),
    marginBottom: vScale(2),
  },
  infoValue: {
    color: '#0087D3',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0087D3',
    borderRadius: scale(12),
    paddingVertical: vScale(12),
    alignItems: 'center',
    marginTop: vScale(8),
  },
  buttonText: {
    color: '#f1f1f1',
    fontWeight: 'bold',
    fontSize: scale(16),
  },
});

export default ChallengeCard; 