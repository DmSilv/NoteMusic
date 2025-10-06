import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { getLevelColors } from '../../../constants/LevelColors';

interface LoadingComponentProps {
  message?: string;
  userLevel?: string;
  size?: 'small' | 'large';
  showMessage?: boolean;
  style?: any;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Carregando...',
  userLevel = 'aprendiz',
  size = 'large',
  showMessage = true,
  style
}) => {
  const levelColors = getLevelColors(userLevel);

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        size={size} 
        color={levelColors.primary} 
        style={styles.indicator}
      />
      {showMessage && (
        <Text style={[styles.message, { color: levelColors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicator: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

