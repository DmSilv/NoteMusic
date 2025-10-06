import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import quizService from '../../../services/quizService';

interface QuizValidationProps {
  quizId: string;
  moduleId: string;
  onStartQuiz: () => void;
  onBack: () => void;
  quizTitle?: string;
}

interface ValidationStatus {
  canAttempt: boolean;
  reason: string;
  timeRemaining?: number;
  cooldownUntil?: string;
  attemptNumber?: number;
  maxAttempts?: number;
}

const QuizValidation: React.FC<QuizValidationProps> = ({
  quizId,
  moduleId,
  onStartQuiz,
  onBack,
  quizTitle = 'Quiz'
}) => {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);

  // ✅ VERIFICAR STATUS DO QUIZ AO CARREGAR
  useEffect(() => {
    checkQuizStatus();
  }, [quizId, moduleId]);

  // ✅ TIMER PARA COOLDOWN
  useEffect(() => {
    if (!validationStatus?.cooldownUntil) return;

    const timer = setInterval(() => {
      const now = new Date();
      const cooldownEnd = new Date(validationStatus.cooldownUntil!);
      const remaining = cooldownEnd.getTime() - now.getTime();

      if (remaining <= 0) {
        // Cooldown expirado - verificar novamente
        setTimeRemaining(null);
        checkQuizStatus();
      } else {
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeRemaining({ minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [validationStatus?.cooldownUntil]);

  // ✅ FUNÇÃO PARA VERIFICAR STATUS DO QUIZ
  const checkQuizStatus = async () => {
    try {
      setIsLoading(true);
      console.log(`🔍 Verificando status do quiz ${quizId} para iniciar...`);
      
      const status = await quizService.canStartQuiz(quizId, moduleId);
      console.log(`📊 Status do quiz:`, status);
      
      setValidationStatus(status);
      
      // Se há cooldown, calcular tempo restante
      if (status.cooldownUntil) {
        const now = new Date();
        const cooldownEnd = new Date(status.cooldownUntil);
        const remaining = cooldownEnd.getTime() - now.getTime();
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeRemaining({ minutes, seconds });
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do quiz:', error);
      // Em caso de erro, permitir tentar
      setValidationStatus({
        canAttempt: true,
        reason: 'error_fallback',
        message: 'Erro na verificação - permitindo tentativa'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA ATUALIZAR STATUS
  const refreshStatus = () => {
    checkQuizStatus();
  };

  // ✅ RENDERIZAR STATUS DE CARREGAMENTO
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando status do quiz...</Text>
      </View>
    );
  }

  // ✅ RENDERIZAR STATUS DE BLOQUEIO
  if (!validationStatus?.canAttempt) {
    return (
      <View style={styles.container}>
        <View style={styles.statusCard}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={48} 
            color="#FF9800" 
          />
          
          <Text style={styles.statusTitle}>Quiz Bloqueado</Text>
          
          <Text style={styles.statusMessage}>
            {validationStatus?.reason === 'cooldown' 
              ? 'Este quiz está em suspensão temporária devido ao número máximo de tentativas.'
              : 'Você não pode tentar este quiz no momento.'}
          </Text>

          {/* ✅ TIMER DE COOLDOWN */}
          {timeRemaining && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Próxima tentativa disponível em:</Text>
              <Text style={styles.timerText}>
                {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* ✅ INFORMAÇÕES ADICIONAIS */}
          {validationStatus?.attemptNumber && validationStatus?.maxAttempts && (
            <View style={styles.attemptsInfo}>
              <Text style={styles.attemptsText}>
                Tentativas utilizadas: {validationStatus.attemptNumber}/{validationStatus.maxAttempts}
              </Text>
            </View>
          )}

          {/* ✅ BOTÕES DE AÇÃO */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={refreshStatus}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Atualizar Status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.tertiaryButton]} 
              onPress={onBack}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#666" />
              <Text style={styles.tertiaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ✅ RENDERIZAR STATUS DE PERMISSÃO
  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <MaterialCommunityIcons 
          name="check-circle-outline" 
          size={48} 
          color="#4CAF50" 
        />
        
        <Text style={styles.statusTitle}>Quiz Disponível</Text>
        
        <Text style={styles.statusMessage}>
          {validationStatus?.reason === 'primeira_tentativa' 
            ? 'Você pode fazer este quiz pela primeira vez!'
            : validationStatus?.reason === 'segunda_tentativa'
            ? 'Esta é sua segunda tentativa para este quiz.'
            : 'Você pode tentar este quiz novamente.'}
        </Text>

        {/* ✅ INFORMAÇÕES DE TENTATIVAS */}
        {validationStatus?.attemptNumber && validationStatus?.maxAttempts && (
          <View style={styles.attemptsInfo}>
            <Text style={styles.attemptsText}>
              Tentativa: {validationStatus.attemptNumber}/{validationStatus.maxAttempts}
            </Text>
            {validationStatus.attemptNumber === 2 && (
              <Text style={styles.warningText}>
                ⚠️ Esta é sua última tentativa!
              </Text>
            )}
          </View>
        )}

        {/* ✅ BOTÃO PARA INICIAR QUIZ */}
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={onStartQuiz}
        >
          <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Iniciar Quiz</Text>
        </TouchableOpacity>

        {/* ✅ BOTÃO VOLTAR */}
        <TouchableOpacity 
          style={[styles.button, styles.tertiaryButton]} 
          onPress={onBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#666" />
          <Text style={styles.tertiaryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#131313',
    marginTop: 16,
    marginBottom: 12,
    fontFamily: 'Roboto-Bold',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  timerContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  timerLabel: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 8,
    fontFamily: 'Roboto-Medium',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E65100',
    fontFamily: 'Roboto-Bold',
  },
  attemptsInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  attemptsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto-Medium',
  },
  warningText: {
    fontSize: 12,
    color: '#CC5500',
    marginTop: 4,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 12,
    width: '100%',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  tertiaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tertiaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto-Regular',
  },
});

export default QuizValidation;
