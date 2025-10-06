import React from 'react';
import { Text, View } from 'react-native';
import styles from './Style'; // Importa os estilos

const TitleComponent = ({ title, color, fontFamily, fontSize, truncate = true }) => {
  // Truncar por padrão para evitar quebra de layout em todas as telas
  const displayTitle = truncate && title && title.length > 20 ? title.substring(0, 20) + '...' : title;
  
  return (
    <View style={styles.titleContainer}>
      <Text 
        style={[styles.Title, { color: color || '#0087D3', fontFamily: fontFamily || 'Roboto', fontSize: fontSize || 24 }]}
        numberOfLines={truncate ? 2 : undefined} // Limita linhas se truncate for true
        ellipsizeMode={truncate ? "tail" : undefined} // Adiciona "..." se truncate for true
      >
        {displayTitle}
      </Text>
    </View>
  );
};

export default TitleComponent;
