import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import ScreenScrollContainer from '@/shared/components/layout/ScreenScrollContainer';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import { useAuth } from '@/contexts/AuthContext';
import { appAlert } from '@/shared/utils/appAlert';
import {
  getFocusCandidates,
  setStudyFocus,
  toStudyFocus,
} from '@/shared/utils/studyFocus';
import { getCategoryDisplayName } from '@/shared/constants/CategoryNames';
import {
  mapFamiliarityToLevel,
  mapStudyDaysToWeeklyGoal,
  resolveFocusCategory,
  setStudyProfile,
} from '@/shared/utils/studyProfile';
import {
  cancelStudyReminders,
  openAppNotificationSettings,
  syncStudyReminders,
  getReminderEnableFailureReason,
  getReminderEnableFailureCopy,
} from '@/shared/services/studyReminders';
import { AppTypography } from '@/shared/constants/theme';

type PlanStepKey =
  | 'instrument'
  | 'familiarity'
  | 'objective'
  | 'studyDays'
  | 'sessionMinutes'
  | 'notifications';

type PlanStep = {
  key: PlanStepKey;
  question: string;
  hint?: string;
  options: Array<{ label: string; value: string; description?: string }>;
};

export const PLAN_STEPS: PlanStep[] = [
  {
    key: 'instrument',
    question: 'Qual instrumento ou contexto combina mais com você?',
    hint: 'Usamos isso para priorizar o tipo de conteúdo no seu plano.',
    options: [
      { label: 'Piano ou teclado', value: 'piano' },
      { label: 'Violão ou guitarra', value: 'violao' },
      { label: 'Canto ou voz', value: 'canto' },
      { label: 'Teoria / estudo geral', value: 'teoria' },
      { label: 'Outro instrumento', value: 'outro' },
    ],
  },
  {
    key: 'familiarity',
    question: 'Qual é o seu nível atual com teoria musical?',
    hint: 'Isso ajuda a sugerir por onde começar — o nível real sobe com os módulos.',
    options: [
      { label: 'Começando do zero', value: 'aprendiz' },
      { label: 'Sei o básico', value: 'aprendiz_basico', description: 'Notas, figuras e compassos' },
      { label: 'Já vi escalas e intervalos', value: 'virtuoso' },
      { label: 'Quero conteúdo avançado', value: 'maestro' },
    ],
  },
  {
    key: 'objective',
    question: 'O que você mais quer alcançar com o NoteMusic?',
    options: [
      { label: 'Ler partituras com mais segurança', value: 'leitura' },
      { label: 'Melhorar ritmo e compassos', value: 'ritmo' },
      { label: 'Dominar escalas e intervalos', value: 'harmonia' },
      { label: 'Preparar prova ou vestibular', value: 'prova' },
      { label: 'Manter constância, sem pressão', value: 'constancia' },
    ],
  },
  {
    key: 'studyDays',
    question: 'Quantos dias por semana você consegue estudar?',
    hint: 'Definimos uma meta semanal de módulos compatível com sua rotina.',
    options: [
      { label: '2–3 dias', value: 'days_light', description: 'Ritmo leve · cerca de 3 módulos/semana' },
      { label: '4–5 dias', value: 'days_medium', description: 'Ritmo constante · cerca de 5 módulos/semana' },
      { label: 'Quase todos os dias', value: 'days_intense', description: 'Ritmo intenso · cerca de 7 módulos/semana' },
    ],
  },
  {
    key: 'sessionMinutes',
    question: 'Quanto tempo você costuma ter por sessão?',
    hint: 'No futuro, usaremos isso para lembretes no horário certo.',
    options: [
      { label: 'Até 10 minutos', value: '10' },
      { label: 'Cerca de 15–20 minutos', value: '20' },
      { label: '30 minutos ou mais', value: '30' },
    ],
  },
  {
    key: 'notifications',
    question: 'Quer receber lembretes para estudar?',
    hint:
      'Se ativar, pedimos permissão no celular e agendamos lembretes nos dias do seu plano (às 19:00). Você pode desligar depois em Conta ou no Plano de estudo.',
    options: [
      { label: 'Sim, quero ser lembrado', value: 'yes' },
      { label: 'Agora não', value: 'no' },
    ],
  },
];

export default function SelectLevelPerson({ navigation }) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { horizontalPadding, formFieldWidth, isCompactHeight } = useResponsiveLayout();
  const { chrome } = useLevelTheme('aprendiz');

  const current = PLAN_STEPS[step];
  const selected = answers[current.key];
  const isLast = step === PLAN_STEPS.length - 1;
  const progressPct = ((step + 1) / PLAN_STEPS.length) * 100;

  const finishDestination = () => {
    navigation.replace('ProfileHome');
  };

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  };

  const persistPlan = async () => {
    if (!user?.id) {
      finishDestination();
      return;
    }

    setSaving(true);
    try {
      const weeklyGoal = mapStudyDaysToWeeklyGoal(answers.studyDays || 'days_medium');
      const preferredLevel = mapFamiliarityToLevel(answers.familiarity || 'aprendiz');
      const focusCategory = resolveFocusCategory(
        answers.instrument || 'teoria',
        answers.objective || 'constancia'
      );
      const wantPush = answers.notifications === 'yes';
      const sessionMinutes = Number(answers.sessionMinutes || 20);

      await updateUser({
        weeklyGoal,
        notifications: {
          email: user.notifications?.email !== false,
          push: wantPush,
        },
      });

      await AsyncStorage.setItem(
        `@NoteMusic:contentPreference:${user.id}`,
        preferredLevel
      );

      await setStudyProfile(user.id, {
        instrument: answers.instrument || 'teoria',
        familiarity: answers.familiarity || 'aprendiz',
        objective: answers.objective || 'constancia',
        studyDays: answers.studyDays || 'days_medium',
        sessionMinutes,
        notificationsPreferred: wantPush,
        reminderHour: 19,
        reminderMinute: 0,
        reminderMode: 'fixed',
        updatedAt: new Date().toISOString(),
      });

      // Flag local + agenda lembretes nativos (Android)
      await AsyncStorage.setItem(
        `@NoteMusic:notificationsPreferred:${user.id}`,
        wantPush ? '1' : '0'
      );

      if (wantPush) {
        try {
          const scheduled = await syncStudyReminders(user.id, { requestPermission: true });
          if (!scheduled) {
            const reason = getReminderEnableFailureReason();
            if (reason) {
              const help = getReminderEnableFailureCopy(reason);
              appAlert(
                help.title,
                help.message,
                [
                  { text: 'Depois', style: 'cancel' },
                  {
                    text: 'Abrir configurações',
                    onPress: () => {
                      openAppNotificationSettings();
                    },
                  },
                ],
                { variant: 'warning' }
              );
            }
          }
        } catch (reminderError) {
          if (__DEV__) {
            console.warn('Lembretes não agendados:', reminderError);
          }
        }
      } else {
        await cancelStudyReminders(user.id).catch(() => {});
      }

      const candidates = await getFocusCandidates(user.id, preferredLevel);
      const inCategory = candidates.filter((m) => (m.category || '') === focusCategory);
      const pick = inCategory[0] || candidates[0];

      if (pick) {
        await setStudyFocus(user.id, toStudyFocus(pick));
      } else {
        await setStudyFocus(user.id, {
          moduleId: `pending:${focusCategory}`,
          moduleTitle: getCategoryDisplayName(focusCategory),
          category: focusCategory,
          categoryName: getCategoryDisplayName(focusCategory),
          level: preferredLevel,
        });
      }

      await AsyncStorage.setItem(`@NoteMusic:onboardingPlanDone:${user.id}`, '1');
      finishDestination();
    } catch (error: any) {
      appAlert(
        'Quase lá',
        error?.message ||
          'Não foi possível salvar o plano. Você pode configurar depois em Plano de estudo.',
        [
          {
            text: 'Ir para o app',
            onPress: finishDestination,
          },
        ],
        { variant: 'warning' }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (!selected || saving) return;
    if (!isLast) {
      setStep((prev) => prev + 1);
      return;
    }
    persistPlan();
  };

  const handleBack = () => {
    if (saving) return;
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <LevelScreenShell level="aprendiz">
      <View style={styles.container}>
        <ScreenScrollContainer
          bottomInset={insets.bottom}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={[styles.progressCard, { width: formFieldWidth, alignSelf: 'center' }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.stepText, { color: chrome.primary }]}>
                Etapa {step + 1} de {PLAN_STEPS.length}
              </Text>
              {step > 0 ? (
                <TouchableOpacity onPress={handleBack} disabled={saving} hitSlop={8}>
                  <Text style={[styles.backStepText, { color: chrome.primary }]}>Voltar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPct}%`, backgroundColor: chrome.primary },
                ]}
              />
            </View>
          </View>

          <View style={[styles.card, { width: formFieldWidth, alignSelf: 'center' }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name={current.key === 'notifications' ? 'bell-outline' : 'clipboard-text-outline'}
                size={22}
                color={chrome.primary}
              />
              <Text style={[styles.question, isCompactHeight && styles.questionCompact]}>
                {current.question}
              </Text>
            </View>
            {current.hint ? <Text style={styles.cardHint}>{current.hint}</Text> : null}

            {current.options.map((option) => {
              const isSelected = selected === option.value;
              return (
                <TouchableOpacity
                  key={`${current.key}-${option.value}`}
                  style={[
                    styles.option,
                    isSelected && {
                      borderColor: chrome.primary,
                      backgroundColor: '#F7FBFE',
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => handleSelect(option.value)}
                  disabled={saving}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionBody}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && { color: chrome.primary, fontWeight: '700' },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    ) : null}
                  </View>
                  <MaterialCommunityIcons
                    name={isSelected ? 'check-circle' : 'circle-outline'}
                    size={22}
                    color={isSelected ? chrome.primary : '#C5D0D8'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {isLast ? (
            <Text style={[styles.changeLaterNote, { width: formFieldWidth }]}>
              Você pode alterar meta e foco depois, quando quiser, em Plano de estudo.
            </Text>
          ) : null}

          <PrimaryButton
            title={saving ? 'Salvando...' : isLast ? 'Começar a estudar' : 'Próximo'}
            onPress={handleNext}
            disabled={!selected || saving}
            styleWidth={{ width: formFieldWidth, alignSelf: 'center' }}
          />
          {saving ? (
            <ActivityIndicator color={chrome.primary} style={{ marginTop: 12 }} />
          ) : null}
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
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  progressCard: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#E8EEF2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
  },
  stepText: {
    fontFamily: AppTypography.family.bold,
    fontSize: 13,
  },
  backStepText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  question: {
    flex: 1,
    fontSize: 18,
    fontFamily: AppTypography.family.bold,
    color: '#232323',
    lineHeight: 24,
  },
  questionCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  cardHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 14,
  },
  option: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionBody: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#232323',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    lineHeight: 16,
  },
  changeLaterNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    alignSelf: 'center',
  },
});
