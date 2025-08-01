import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ValidationProps {
  isValid: boolean;
  message: string;
  show: boolean;
}

const Validation: React.FC<ValidationProps> = ({ isValid, message, show }) => {
  if (!show) return null;

  return (
    <View style={[
      styles.container,
      isValid ? styles.validContainer : styles.invalidContainer
    ]}>
      <Text style={[
        styles.message,
        isValid ? styles.validMessage : styles.invalidMessage
      ]}>
        {isValid ? '✓' : '✗'} {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Math.max(4, screenHeight * 0.005),
    paddingHorizontal: Math.max(8, screenWidth * 0.02),
    borderRadius: Math.max(4, screenWidth * 0.01),
    marginTop: Math.max(4, screenHeight * 0.005),
  },
  validContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  invalidContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  message: {
    fontSize: Math.max(12, screenWidth * 0.03),
    fontFamily: 'Roboto-Regular',
  },
  validMessage: {
    color: '#4CAF50',
  },
  invalidMessage: {
    color: '#F44336',
  },
});

export default Validation; 