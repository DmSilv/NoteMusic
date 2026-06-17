import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './Style'; // Importando o estilo

const ButtonComponent = ({ title, onPress, styleWidth }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={[styles.buttonText, styleWidth]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
