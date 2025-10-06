import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QuizValidation from '../QuizValidation/QuizValidation';

interface QuizDescriptionProps {
  navigation: any;
  route: any;
}

const QuizDescription: React.FC<QuizDescriptionProps> = ({ navigation, route }) => {
  const [showValidation, setShowValidation] = useState(false);

  const {
    quizId = '',
    moduleId = '',
    quizTitle = 'Quiz',
    description = 'Descrição do quiz...',
    category = 'Categoria',
    difficulty = 'Médio',
    estimatedTime = '5 min',
    questionsCount = 5
  } = route.params || {};

  // ✅ FUNÇÃO PARA INICIAR QUIZ
  const handleStartQuiz = () => {
    console.log('🚀 Iniciando quiz:', { quizId, moduleId });
    navigation.navigate('Quiz', {
      moduleId,
      isRetry: false,
      attempts: { current: 1, remaining: 1, maxAttempts: 2 }
    });
  };

  // ✅ FUNÇÃO PARA VOLTAR
  const handleBack = () => {
    navigation.goBack();
  };

  // ✅ FUNÇÃO PARA MOSTRAR VALIDAÇÃO
  const handleShowValidation = () => {
    setShowValidation(true);
  };

  // ✅ RENDERIZAR VALIDAÇÃO SE NECESSÁRIO
  if (showValidation) {
    return (
      <QuizValidation
        quizId={quizId}
        moduleId={moduleId}
        onStartQuiz={handleStartQuiz}
        onBack={() => setShowValidation(false)}
        quizTitle={quizTitle}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Descrição do Quiz</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Principal */}
        <View style={styles.mainCard}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="quiz"
              size={32}
              color="#007AFF"
            />
            <Text style={styles.quizTitle}>{quizTitle}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Informações do Quiz */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Informações do Quiz</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="tag" size={20} color="#666" />
              <Text style={styles.infoLabel}>Categoria</Text>
              <Text style={styles.infoValue}>{category}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#666" />
              <Text style={styles.infoLabel}>Dificuldade</Text>
              <Text style={styles.infoValue}>{difficulty}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Tempo Estimado</Text>
              <Text style={styles.infoValue}>{estimatedTime}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Questões</Text>
              <Text style={styles.infoValue}>{questionsCount}</Text>
            </View>
          </View>
        </View>

        {/* Regras e Instruções */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📋 Regras e Instruções</Text>

          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>
              Você tem {questionsCount} questões para responder
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>
              Tempo estimado: {estimatedTime}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>
              Máximo de 2 tentativas por quiz
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>
              Cooldown de 30 minutos após esgotar tentativas
            </Text>
          </View>
        </View>

        {/* Botão de Início */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleShowValidation}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Verificar e Iniciar Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131313',
    fontFamily: 'Roboto-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#131313',
    marginLeft: 12,
    fontFamily: 'Roboto-Bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontFamily: 'Roboto-Regular',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131313',
    marginBottom: 20,
    fontFamily: 'Roboto-Bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131313',
    fontFamily: 'Roboto-Bold',
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131313',
    marginBottom: 20,
    fontFamily: 'Roboto-Bold',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    fontFamily: 'Roboto-Regular',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Bold',
  },
});

export default QuizDescription;
