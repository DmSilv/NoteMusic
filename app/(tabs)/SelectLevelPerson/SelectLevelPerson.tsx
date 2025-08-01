import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import PrimaryButton from '../Components/Button/PrimaryButton';

const steps = [
  {
    question: 'Qual seu maior objetivo com teoria musical?',
    options: [
      'Ler partituras com facilidade',
      'Melhorar percepção rítmica',
      'Se preparar para provas/vestibulares',
      'Desafiar meus conhecimentos',
      'Outro',
    ],
  },
  {
    question: 'Qual seu nível de familiaridade com teoria musical?',
    options: [
      'Nunca estudei',
      'Sei o básico (notas, figuras)',
      'Já estudei escalas, intervalos, etc.',
      'Avançado (harmonia, análise, etc)',
    ],
  },
  {
    question: 'O que você mais gosta de praticar?',
    options: [
      'Leitura de partituras',
      'Ditado rítmico',
      'Identificação de acordes',
      'Quiz de teoria geral',
    ],
  },
];

export default function SelectLevelPerson({ navigation }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // Salvar perfil, dar feedback e navegar para Home
      alert('Parabéns! Você já ganhou seu primeiro troféu: “Primeiro Passo” 🏅');
      navigation.replace('ProfileHome');
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de progresso */}
      {Platform.OS === 'android' ? (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${((step + 1) / steps.length) * 100}%` }]} />
        </View>
      ) : null}
      <Text style={styles.stepText}>Passo {step + 1} de {steps.length}</Text>
      <Text style={styles.question}>{steps[step].question}</Text>
      {steps[step].options.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            answers[step] === option && styles.optionSelected,
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
      <PrimaryButton
        title={step < steps.length - 1 ? 'Próximo' : 'Finalizar'}
        onPress={handleNext}
        disabled={!answers[step]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8F9FA' },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0087D3',
    borderRadius: 4,
  },
  stepText: { color: '#0087D3', fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  question: { fontSize: 20, fontWeight: 'bold', marginBottom: 18, color: '#232323' },
  option: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, marginBottom: 10 },
  optionSelected: { borderWidth: 2, borderColor: '#0087D3', backgroundColor: '#BBDEFB' },
  optionText: { fontSize: 16, color: '#232323' },
});
