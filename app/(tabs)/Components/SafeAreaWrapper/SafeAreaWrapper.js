// SafeAreaWrapper.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

const SafeAreaWrapper = ({ children }) => {
  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Cor de fundo que você deseja
  },
});

export default SafeAreaWrapper;
