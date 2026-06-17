import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './Style';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  styleWidth?: ViewStyle;
  style?: ViewStyle;
  styleText?: TextStyle;
  loading?: boolean;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  styleWidth,
  style,
  styleText,
  loading = false,
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        styleWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={22}
          color="#FFF"
          style={{ marginRight: 10 }}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          disabled && styles.buttonTextDisabled,
          styleText,
        ]}
      >
        {loading ? 'Carregando...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
