import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import ScreenScrollContainer from '@/shared/components/layout/ScreenScrollContainer';
import { getLevelColors } from '@/shared/constants/theme';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';

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
      'Maestro (harmonia, análise, etc)',
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
  const insets = useSafeAreaInsets();
  const { horizontalPadding, formFieldWidth, isCompactHeight } = useResponsiveLayout();
  
  // Cores baseadas no nível padrão (aprendiz)
  const levelColors = getLevelColors('aprendiz');

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // Salvar perfil e navegar para Home
      navigation.replace('ProfileHome');
    }
  };

  return (
    <LevelScreenShell>
      <ScreenScrollContainer
        bottomInset={insets.bottom}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        {Platform.OS === 'android' ? (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${((step + 1) / steps.length) * 100}%`, backgroundColor: levelColors.primary }]} />
          </View>
        ) : null}
        <Text style={[styles.stepText, { color: levelColors.primary }]}>Passo {step + 1} de {steps.length}</Text>
        <Text style={[styles.question, isCompactHeight && styles.questionCompact]}>{steps[step].question}</Text>
        {steps[step].options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              { backgroundColor: levelColors.secondary },
              answers[step] === option && { 
                borderWidth: 2, 
                borderColor: levelColors.primary, 
                backgroundColor: levelColors.accent 
              },
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
          styleWidth={{ width: formFieldWidth, alignSelf: 'center' }}
        />
      </ScreenScrollContainer>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
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
  questionCompact: { fontSize: 18, marginBottom: 14 },
  option: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, marginBottom: 10, flexShrink: 1 },
  optionSelected: { borderWidth: 2, borderColor: '#0087D3', backgroundColor: '#BBDEFB' },
  optionText: { fontSize: 16, color: '#232323' },
});
