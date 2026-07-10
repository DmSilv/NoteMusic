import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import styles from './Style';

type TertiaryButtonProps = {
  title: string;
  onPress: () => void;
  stylewidht?: ViewStyle;
  styleWidth?: ViewStyle;
};

const TertiaryButton: React.FC<TertiaryButtonProps> = ({
  title,
  onPress,
  stylewidht,
  styleWidth,
}) => {
  const widthStyle = styleWidth ?? stylewidht;

  return (
    <TouchableOpacity
      style={[styles.button, widthStyle]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default TertiaryButton;
