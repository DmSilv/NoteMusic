import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import styles from './Style';

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
  styleWidth?: ViewStyle;
};

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, styleWidth }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styleWidth]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;
