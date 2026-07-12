import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ScreenScrollContainer from '@/shared/components/layout/ScreenScrollContainer';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import { AppTypography, getLevelColors } from '@/shared/constants/theme';
import { logoNameImageStyles } from '@/shared/constants/logoNameLayout';
import LogoName from '@/assets/images/LogoName.png';

/**
 * Uma única tela introdutória após o cadastro:
 * proposta do app + como funcionam os níveis.
 * Em seguida o usuário monta o plano de estudo (SelectLevelPerson).
 */
export const APP_INTRO_CONTENT = {
  title: 'Como funciona o NoteMusic',
  body:
    'Você estuda teoria em módulos curtos, fixa com quizzes e acompanha o progresso no seu ritmo — sem precisar estudar tudo de uma vez.',
  levelsTitle: 'Trilha de níveis',
  levels: [
    {
      name: 'Aprendiz',
      detail: 'Fundamentos — notas, figuras, compassos e dinâmica.',
    },
    {
      name: 'Virtuoso',
      detail: 'Desbloqueia após completar os módulos de Aprendiz.',
    },
    {
      name: 'Maestro',
      detail: 'Conteúdo avançado, ao concluir a trilha Virtuoso.',
    },
  ],
  footer:
    'No próximo passo montamos seu plano com base no que você toca, no seu nível e no tempo que tem.',
};

interface AppIntroScreenProps {
  navigation: any;
}

export default function AppIntroScreen({ navigation }: AppIntroScreenProps) {
  const { horizontalPadding, formFieldWidth, isCompactHeight, height } = useResponsiveLayout();
  const { chrome } = useLevelTheme('aprendiz');
  const logoHeight = Math.min(height * 0.26, isCompactHeight ? 210 : 250);

  const goToPlan = () => {
    navigation.replace('SelectLevelPerson');
  };

  return (
    <LevelScreenShell level="aprendiz">
      <View style={styles.container}>
        <ScreenScrollContainer
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={styles.brandBlock}>
            <View
              style={[
                styles.logoClip,
                {
                  width: formFieldWidth,
                  height: logoHeight * 0.48,
                },
              ]}
            >
              <Image
                source={LogoName}
                style={[
                  logoNameImageStyles.image,
                  styles.logo,
                  {
                    width: formFieldWidth,
                    height: logoHeight,
                    marginTop: -(logoHeight * 0.26),
                  },
                ]}
                resizeMode="contain"
                accessibilityLabel="NoteMusic"
              />
            </View>

            <Text
              style={[
                styles.title,
                { color: chrome.primary, fontSize: isCompactHeight ? 20 : 22 },
              ]}
            >
              {APP_INTRO_CONTENT.title}
            </Text>

            <Text
              style={[
                styles.description,
                {
                  width: formFieldWidth,
                  fontSize: isCompactHeight ? 15 : 16,
                  lineHeight: isCompactHeight ? 22 : 24,
                },
              ]}
            >
              {APP_INTRO_CONTENT.body}
            </Text>
          </View>

          <View style={[styles.card, { width: formFieldWidth }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="stairs" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>{APP_INTRO_CONTENT.levelsTitle}</Text>
            </View>

            {APP_INTRO_CONTENT.levels.map((level, index) => {
              const levelColors = getLevelColors(level.name);
              const isLast = index === APP_INTRO_CONTENT.levels.length - 1;
              return (
                <View
                  key={level.name}
                  style={[styles.levelRow, isLast && styles.levelRowLast]}
                >
                  <View style={[styles.levelIcon, { backgroundColor: levelColors.secondary }]}>
                    <MaterialCommunityIcons
                      name="music-note"
                      size={18}
                      color={levelColors.primary}
                    />
                  </View>
                  <View style={styles.levelText}>
                    <Text style={[styles.levelName, { color: levelColors.primary }]}>
                      {level.name}
                    </Text>
                    <Text style={styles.levelDetail}>{level.detail}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={[styles.footerHint, { width: formFieldWidth }]}>
            {APP_INTRO_CONTENT.footer}
          </Text>

          <View style={[styles.footer, { width: formFieldWidth }]}>
            <PrimaryButton
              title="Montar meu plano"
              onPress={goToPlan}
              styleWidth={{ width: formFieldWidth }}
              style={styles.primaryButtonOverride}
            />
          </View>
        </ScreenScrollContainer>
      </View>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoClip: {
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 2,
  },
  logo: {
    alignSelf: 'center',
  },
  title: {
    fontFamily: AppTypography.family.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontFamily: AppTypography.family.regular,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    fontFamily: AppTypography.family.bold,
    fontSize: 16,
    color: '#232323',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  levelRowLast: {
    marginBottom: 4,
  },
  levelIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  levelText: {
    flex: 1,
  },
  levelName: {
    fontFamily: AppTypography.family.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  levelDetail: {
    fontFamily: AppTypography.family.light,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  footerHint: {
    fontFamily: AppTypography.family.light,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 4,
  },
  primaryButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
});
