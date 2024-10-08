import React from 'react';
import { TextInput, View } from 'react-native';
import styles from './Style'; // Importa os estilos

const TextInputComponent = ({ placeholder, onChangeText, secureTextEntry,  styleWidth  }) => {
  return (
    <View style={styleWidth}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
      
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} // Para entrada de senha, por exemplo
      />
    </View>
  );
};

export default TextInputComponent;
