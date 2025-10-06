import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { AppColors, AppSpacing, AppTypography } from '../../../../../../constants/AppStyles';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface UnifiedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: AppSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...getSizeStyle(),
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: AppColors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: AppColors.secondary,
        borderWidth: 0,
      },
      tertiary: {
        backgroundColor: AppColors.accent,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: AppColors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant],
        backgroundColor: AppColors.gray[300],
        borderColor: AppColors.gray[300],
      };
    }

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: AppTypography.family.medium,
      textAlign: 'center',
      ...getSizeTextStyle(),
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: AppColors.white },
      secondary: { color: AppColors.white },
      tertiary: { color: AppColors.white },
      outline: { color: AppColors.primary },
      ghost: { color: AppColors.primary },
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: AppColors.gray[500],
      };
    }

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
    };
  };

  const getSizeStyle = (): ViewStyle => {
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingHorizontal: AppSpacing.sm,
        paddingVertical: AppSpacing.xs,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: AppSpacing.lg,
        paddingVertical: AppSpacing.sm,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: AppSpacing.xl,
        paddingVertical: AppSpacing.md,
        minHeight: 56,
      },
    };
    return sizeStyles[size];
  };

  const getSizeTextStyle = (): TextStyle => {
    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      small: { fontSize: AppTypography.size.sm },
      medium: { fontSize: AppTypography.size.md },
      large: { fontSize: AppTypography.size.lg },
    };
    return sizeTextStyles[size];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? AppColors.primary : AppColors.white} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), textStyle, icon && { marginLeft: AppSpacing.xs }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default UnifiedButton;
