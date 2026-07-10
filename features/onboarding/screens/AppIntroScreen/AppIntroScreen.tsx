import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ScreenScrollContainer from '@/shared/components/layout/ScreenScrollContainer';
import PaginationDots from '@/shared/components/layout/PaginationDots/PaginationDots';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import TertiaryButton from '@/shared/components/form/TertiaryButton/TertiaryButton';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import { getLevelColors, AppTypography } from '@/shared/constants/theme';

/**
 * Sequência curta de telas apresentando as principais funcionalidades do
 * app — substitui o mini quiz que era exibido logo após o cadastro. Não há
 * perguntas nem respostas aqui, apenas navegação por "Avançar"/"Voltar".
 */
export const APP_INTRO_SLIDES: Array<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}> = [
  {
    icon: 'music-note',
    title: 'Bem-vindo ao NoteMusic!',
    description: 'Aprenda teoria musical de um jeito simples, prático e no seu próprio ritmo.',
  },
  {
    icon: 'book-open-page-variant',
    title: 'Módulos organizados por nível',
    description: 'Estude por módulos, do básico ao avançado, evoluindo de Aprendiz até Maestro.',
  },
  {
    icon: 'clipboard-check-outline',
    title: 'Quizzes para testar seu conhecimento',
    description: 'Responda quizzes ao final de cada módulo e veja o quanto você já aprendeu.',
  },
  {
    icon: 'calendar-star',
    title: 'Desafio Diário',
    description: 'Todo dia um desafio novo, com perguntas diferentes, para manter sua prática em dia.',
  },
  {
    icon: 'chart-line',
    title: 'Acompanhe seu progresso',
    description: 'Veja seus pontos, sua sequência de dias e sua evolução de nível direto no perfil.',
  },
];

interface AppIntroScreenProps {
  navigation: any;
}

export default function AppIntroScreen({ navigation }: AppIntroScreenProps) {
  const [step, setStep] = useState(0);
  const { horizontalPadding, formFieldWidth, height: windowHeight, isCompactHeight } = useResponsiveLayout();
  const levelColors = getLevelColors('aprendiz');

  const isFirstSlide = step === 0;
  const isLastSlide = step === APP_INTRO_SLIDES.length - 1;
  const currentSlide = APP_INTRO_SLIDES[step];

  const iconCircleSize = Math.min(Math.max(windowHeight * 0.18, 120), 180);

  const handleNext = () => {
    if (isLastSlide) {
      navigation.replace('ProfileHome');
      return;
    }
    setStep((prev) => Math.min(prev + 1, APP_INTRO_SLIDES.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <LevelScreenShell>
      <ScreenScrollContainer
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        <View style={styles.slideContent}>
          <View
            style={[
              styles.iconCircle,
              {
                width: iconCircleSize,
                height: iconCircleSize,
                borderRadius: iconCircleSize / 2,
                backgroundColor: levelColors.secondary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={currentSlide.icon}
              size={iconCircleSize * 0.5}
              color={levelColors.primary}
            />
          </View>

          <Text
            style={[
              styles.title,
              { color: levelColors.primary, fontSize: isCompactHeight ? 20 : 22 },
            ]}
          >
            {currentSlide.title}
          </Text>

          <Text style={[styles.description, { width: formFieldWidth }]}>
            {currentSlide.description}
          </Text>
        </View>

        <View style={styles.footer}>
          <PaginationDots
            total={APP_INTRO_SLIDES.length}
            currentIndex={step}
            activeColor={levelColors.primary}
          />

          <View style={styles.buttonsRow}>
            {isFirstSlide ? (
              <View style={styles.backButtonPlaceholder} />
            ) : (
              <TertiaryButton
                title="Voltar"
                onPress={handleBack}
                styleWidth={{ width: formFieldWidth * 0.42 }}
              />
            )}
            <PrimaryButton
              title={isLastSlide ? 'Começar' : 'Avançar'}
              onPress={handleNext}
              styleWidth={{ width: formFieldWidth * 0.42 }}
              style={styles.primaryButtonOverride}
            />
          </View>
        </View>
      </ScreenScrollContainer>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 16,
  },
  slideContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: AppTypography.family.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: AppTypography.family.light,
    fontSize: AppTypography.size.md,
    color: '#545454',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  backButtonPlaceholder: {
    flexGrow: 0,
  },
  primaryButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
});
