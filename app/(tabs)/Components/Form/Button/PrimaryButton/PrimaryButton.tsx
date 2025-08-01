import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import styles from './Style';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  styleWidth?: ViewStyle;
  styleText?: TextStyle;
  loading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  disabled = false, 
  styleWidth,
  styleText,
  loading = false 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.buttonDisabled,
        styleWidth
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.buttonText, 
        disabled && styles.buttonTextDisabled,
        styleText
      ]}>
        {loading ? 'Carregando...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
