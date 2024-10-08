// MenuBottom.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Certifique-se de que você tem esta biblioteca instalada

const COLORS = {
  background: '#0A8CD6',
  activeText: '#FFFFFF',
  inactiveText: '#FFFFFF',
  activeButtonBorder: '#FFFFFF',
  iconActive: '#FFFFFF',
  iconInactive: '#FFFFFF',
};

const MenuBottom = ({ navigateToHome, navigateToProfile, currentScreen }) => {
  const isHomeActive = currentScreen === 'home';
  const isProfileActive = currentScreen === 'profile';

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navButton, isHomeActive && styles.activeButton]}
        onPress={navigateToHome}
      >
        <Icon
          name="home-outline"
          size={isHomeActive ? 28 : 24}
          color={isHomeActive ? COLORS.iconActive : COLORS.iconInactive}
          style={isHomeActive && styles.activeIcon}
        />
        <Text style={[styles.navButtonText, { color: isHomeActive ? COLORS.inactiveText : COLORS.inactiveText }]}>
          Início
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, isProfileActive && styles.activeButton]}
        onPress={navigateToProfile}
      >
        <Icon
          name="person-outline"
          size={isProfileActive ? 28 : 24}
          color={isProfileActive ? COLORS.activeText : COLORS.inactiveText}
          style={isProfileActive && styles.activeIcon}
        />
        <Text style={[styles.navButtonText, { color: isProfileActive ? COLORS.inactiveText : COLORS.inactiveText }]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: COLORS.background, // Usando constante
    height: 75,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
    position: 'relative',
  },
  activeButton: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.activeButtonBorder, // Usando constante
  },
  activeIcon: {
    transform: [{ scale: 1.1 }], // Aumenta o ícone ativo
    textShadowColor: '#000', // Sombreamento para profundidade
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    transition: 'color 0.2s ease-in-out',
  },
});

export default MenuBottom;
