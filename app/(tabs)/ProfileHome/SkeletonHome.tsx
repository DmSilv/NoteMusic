import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function SkeletonHome() {
  return (
    <View style={styles.container}>
      {/* Badge + Saudação */}
      <View style={styles.skeletonBadge} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonTextSmall} />

      {/* Cards de evolução */}
      <View style={styles.statsRow}>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </View>

      {/* Banner de conquista */}
      <View style={styles.skeletonBanner} />

      {/* Botão de categorias */}
      <View style={styles.skeletonButton} />

      {/* Card de desafio IA */}
      <View style={styles.skeletonCardIA} />
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
  skeletonBadge: {
    width: 110,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  skeletonText: {
    width: 180,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  skeletonTextSmall: {
    width: 140,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
  },
  skeletonCard: {
    width: 110,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  skeletonBanner: {
    width: '100%',
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    marginBottom: 18,
  },
  skeletonButton: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginBottom: 28,
  },
  skeletonCardIA: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 32,
  },
});