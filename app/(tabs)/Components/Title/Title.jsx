import React from 'react';
import { Text, View } from 'react-native';
import styles from './Style'; // Importa os estilos

const TitleComponent = ({ title, color, fontFamily, fontSize }) => {
  return (
    <View style={styles.titleContainer}>
      <Text style={[styles.Title, { color: color || '#0087D3', fontFamily: fontFamily || 'Roboto', fontSize: fontSize || 24 }]}>
        {title}
      </Text>
    </View>
  );
};

export default TitleComponent;
