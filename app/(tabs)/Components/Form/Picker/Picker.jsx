import React from 'react';
import { View, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from './Style'; // Importa os estilos

const windowWidth = Dimensions.get('window').width;

const PickerComponent = ({ selectedValue, onValueChange, items }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        style={[styles.picker, { width: windowWidth * 0.85 }]} // Adapta a largura ao tamanho da tela
        onValueChange={onValueChange}
      >
        {items.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

export default PickerComponent;
