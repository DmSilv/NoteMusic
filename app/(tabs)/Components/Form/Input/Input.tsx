import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, TextInputProps, Text } from 'react-native';
import styles from './Style';

interface InputProps extends TextInputProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  styleWidth?: any;
  error?: string;
  label?: string;
}

const Input: React.FC<InputProps> = ({ 
  placeholder, 
  onChangeText, 
  secureTextEntry = false, 
  styleWidth,
  error,
  label,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styleWidth}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError
        ]}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#A3A3A3"
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

export default Input;
