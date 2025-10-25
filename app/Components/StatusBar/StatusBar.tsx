import React from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = '#007AFF',
  barStyle = 'light-content',
  translucent = false
}) => {
  return (
    <RNStatusBar
      barStyle={barStyle}
      backgroundColor={Platform.OS === 'android' ? backgroundColor : undefined}
      translucent={translucent}
      animated={true}
    />
  );
};

export default CustomStatusBar;
