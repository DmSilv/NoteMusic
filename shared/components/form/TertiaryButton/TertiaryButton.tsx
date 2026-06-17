import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './Style'; // Importando o estilo

const ButtonComponent = ({ title, onPress, stylewidht }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={[styles.buttonText, stylewidht]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
