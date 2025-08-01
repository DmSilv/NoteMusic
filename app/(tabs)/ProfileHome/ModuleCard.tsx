import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => size * (width / 375);
const vScale = (size: number) => size * (height / 812);

interface ModuleCardProps {
  title: string;
  description: string;
  time: string;
  onPress: () => void;
  index?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, time, onPress, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 100 + (index * 120),
      useNativeDriver: true,
    }).start();
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      delay: 100 + (index * 120),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, translateY, index]);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPress();
    }, 600);
  };

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY }],
    }}>
      <View style={styles.moduleCard}>
        <View style={styles.containerModuleTitle}>
          <View style={styles.containerNoteIcon}>
            <Image
              source={require('../../../assets/images/music-note.png')}
              style={[styles.image, styles.Note]}
            />
          </View>
          <Text style={styles.moduleTitle}>{title}</Text>
        </View>
        <Text style={styles.moduleDescription}>{description}</Text>
        <View style={styles.moduleFooter}>
          <View style={styles.containerModuleTime}>
            <Image
              source={require('../../../assets/images/clock.png')}
              style={[styles.image, styles.clock]}
            />
            <Text style={styles.moduleTime}>{time}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonLoading]} 
            onPress={handlePress} 
            activeOpacity={0.6}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`Iniciar módulo ${title}`}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Iniciar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  moduleCard: {
    backgroundColor: 'rgba(0, 163, 255, 0.04)',
    padding: vScale(16),
    marginBottom: vScale(16),
    borderRadius: scale(12),
  },
  containerModuleTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerNoteIcon: {
    backgroundColor: '#C6E8FF',
    padding: scale(2),
    marginRight: scale(6),
    borderRadius: scale(4),
  },
  image: {
    resizeMode: 'contain',
  },
  Note: {
    height: scale(20),
    width: scale(20),
    margin: scale(1),
  },
  moduleTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#0087D3',
  },
  moduleDescription: {
    fontSize: scale(15),
    color: '#545454',
    marginVertical: vScale(8),
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleTime: {
    fontSize: scale(13),
    color: '#131313',
    fontFamily: 'Poppins-Regular',
  },
  containerModuleTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clock: {
    width: scale(16),
    height: scale(16),
    marginRight: scale(4),
    marginBottom: scale(2),
  },
  button: {
    backgroundColor: '#0087D3',
    paddingVertical: vScale(8),
    paddingHorizontal: scale(24),
    borderRadius: scale(16),
    minWidth: scale(80),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFCFC',
    fontWeight: 'bold',
    fontSize: scale(15),
  },
});

export default ModuleCard; 