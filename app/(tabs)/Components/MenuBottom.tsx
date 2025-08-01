import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type MenuBottomProps = {
  current: 'home' | 'profile';
  goHome: () => void;
  goProfile: () => void;
};

const MenuBottom: React.FC<MenuBottomProps> = ({ current, goHome, goProfile }) => (
  <View style={styles.menuBottom}>
    <TouchableOpacity style={styles.menuItem} onPress={goHome}>
      <MaterialCommunityIcons
        name="home-variant"
        size={28}
        color={current === 'home' ? '#0087D3' : '#A3A3A3'}
      />
      <Text style={[styles.menuLabel, current === 'home' && styles.menuLabelActive]}>Início</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
      <MaterialCommunityIcons
        name="account-circle"
        size={28}
        color={current === 'profile' ? '#0087D3' : '#A3A3A3'}
      />
      <Text style={[styles.menuLabel, current === 'profile' && styles.menuLabelActive]}>Perfil</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  menuBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 12,
    elevation: 8,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    marginTop: 2,
  },
  menuLabelActive: {
    color: '#0087D3',
    fontWeight: 'bold',
  },
});

export default MenuBottom;