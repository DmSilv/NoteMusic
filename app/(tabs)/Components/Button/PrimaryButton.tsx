import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, GestureResponderEvent } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type PrimaryButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  iconName?: string;
  style?: any;
  disabled?: boolean;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, iconName, style, disabled }) => (
  <TouchableOpacity
    style={[
      styles.button,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.85}
    disabled={disabled}
  >
    {iconName && (
      <MaterialCommunityIcons name={iconName} size={22} color="#FFF" style={{ marginRight: 10 }} />
    )}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0087D3',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    marginTop: 0,
    elevation: 2,
    width: '100%',
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A3A3A3',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default PrimaryButton;