import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, colors } from '../index';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof typography.textStyles;
  color?: string;
  size?: keyof typeof typography.fontSize;
  weight?: keyof typeof typography.fontWeight;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color,
  size,
  weight,
  align = 'auto',
  style,
  children,
  ...props
}) => {
  const textStyle = typography.textStyles[variant];
  
  const customStyle = {
    ...textStyle,
    ...(color && { color }),
    ...(size && { fontSize: typography.fontSize[size] }),
    ...(weight && { fontWeight: typography.fontWeight[weight] }),
    textAlign: align,
  };

  return (
    <RNText style={[customStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

// Predefined text components
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h6" {...props} />
);

export const Body1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body2" {...props} />
);

export const Body3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body3" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const ButtonText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="button" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);

export default Text; 