import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../index';
import Text from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}) => {
  const buttonStyle = getButtonStyle(variant, size);
  const textStyle = getTextStyle(variant, size);

  return (
    <TouchableOpacity
      style={[buttonStyle, disabled && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={textStyle}>
        {loading ? 'Carregando...' : children}
      </Text>
    </TouchableOpacity>
  );
};

const getButtonStyle = (variant: string, size: string): ViewStyle => {
  const baseStyle = {
    borderRadius: spacing.component.button.borderRadius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const sizeStyles = {
    small: {
      paddingVertical: spacing.vsm,
      paddingHorizontal: spacing.sm,
      minHeight: 32,
    },
    medium: {
      paddingVertical: spacing.component.button.paddingVertical,
      paddingHorizontal: spacing.component.button.paddingHorizontal,
      minHeight: 44,
    },
    large: {
      paddingVertical: spacing.vlg,
      paddingHorizontal: spacing.lg,
      minHeight: 56,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
    },
    secondary: {
      backgroundColor: colors.secondary[500],
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size as keyof typeof sizeStyles],
    ...variantStyles[variant as keyof typeof variantStyles],
  };
};

const getTextStyle = (variant: string, size: string) => {
  const baseTextStyle = {
    fontFamily: typography.fontFamily.primary.bold,
    textAlign: 'center' as const,
  };

  const sizeTextStyles = {
    small: {
      fontSize: typography.fontSize.sm,
    },
    medium: {
      fontSize: typography.fontSize.base,
    },
    large: {
      fontSize: typography.fontSize.lg,
    },
  };

  const variantTextStyles = {
    primary: {
      color: colors.text.inverse,
    },
    secondary: {
      color: colors.text.inverse,
    },
    outline: {
      color: colors.primary[500],
    },
    ghost: {
      color: colors.primary[500],
    },
  };

  return {
    ...baseTextStyle,
    ...sizeTextStyles[size as keyof typeof sizeTextStyles],
    ...variantTextStyles[variant as keyof typeof variantTextStyles],
  };
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

// Predefined button components
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export default Button; 