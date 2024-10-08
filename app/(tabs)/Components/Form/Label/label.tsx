import React from 'react';
import { Text, View } from 'react-native';
import styles from './Style'; // Importa os estilos

const LabelComponent = ({ text }) => {
  return (
    <View style={styles.labelContainer}>
        <Text style={styles.label}>{text}</Text>
    </View>
  );
};

export default LabelComponent;
 