import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, spacing } from '../index';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
  margin?: keyof typeof spacing;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  margin,
  children,
  style,
  onPress,
  ...props
}) => {
  const cardStyle = getCardStyle(variant, padding, margin);

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[cardStyle, style]} 
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

const getCardStyle = (variant: string, padding: string, margin?: string): ViewStyle => {
  const baseStyle = {
    borderRadius: spacing.component.card.borderRadius,
    padding: spacing[padding as keyof typeof spacing],
    ...(margin && { margin: spacing[margin as keyof typeof spacing] }),
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.background.primary,
      shadowColor: colors.neutral[900],
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      shadowColor: colors.neutral[900],
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    filled: {
      backgroundColor: colors.background.card,
    },
  };

  return {
    ...baseStyle,
    ...variantStyles[variant as keyof typeof variantStyles],
  };
};

const styles = StyleSheet.create({
  card: {
    // Base card styles
  },
});

// Predefined card components
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="filled" {...props} />
);

export default Card; 