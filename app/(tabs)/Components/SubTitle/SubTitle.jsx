import React from 'react';
import { Text, View } from 'react-native';
import styles from './Style'; // Certifique-se de que o caminho está correto

const SubTitleComponent = ({ subtitle, color, fontFamily, marginRight, marginTop }) => {
  return (
    <View style={[styles.subtitleContainer, { marginTop: marginTop || 8 }]}>
      <Text
        style={[
          styles.SubTitle,
          {
            color: color || '#A3A3A3',
            fontFamily: fontFamily || 'System', // Use uma fonte do sistema ou defina uma fonte padrão
            marginRight: marginRight || 0,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

export default SubTitleComponent;
