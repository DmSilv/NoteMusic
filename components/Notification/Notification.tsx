import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Notification({
  type,
  message,
  title,
  onDismiss,
  duration = 3000
}: NotificationProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animar entrada
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    // Auto-dismissar após duração
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onDismiss();
    });
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'check-circle',
          iconColor: '#FFF',
          titleColor: '#FFF'
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'alert-circle',
          iconColor: '#FFF',
          titleColor: '#FFF'
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: 'alert',
          iconColor: '#FFF',
          titleColor: '#FFF'
        };
      case 'info':
        return {
          backgroundColor: '#0087D3',
          icon: 'information',
          iconColor: '#FFF',
          titleColor: '#FFF'
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <View style={[styles.notification, { backgroundColor: config.backgroundColor }]}>
        <MaterialCommunityIcons 
          name={config.icon as any} 
          size={24} 
          color={config.iconColor} 
        />
        <View style={styles.content}>
          {title && (
            <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
          )}
          <Text style={[styles.message, { color: config.titleColor }]}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 60,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    opacity: 0.95,
    lineHeight: 20,
  },
});

