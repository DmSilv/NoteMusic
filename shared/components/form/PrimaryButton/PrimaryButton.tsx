import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import { MIN_TOUCH_TARGET } from '@/shared/constants/responsive';
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
  const { isCompactHeight } = useResponsiveLayout();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          minHeight: MIN_TOUCH_TARGET,
          marginTop: isCompactHeight ? 16 : 32,
          marginBottom: isCompactHeight ? 8 : 12,
        },
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
