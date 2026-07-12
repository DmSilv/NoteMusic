import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ChromeNavHeader from '@/shared/components/layout/ChromeNavHeader';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import apiService, { Module } from '@/services/api';
import BackButton from '@/shared/components/layout/BackButton/BackButton';
import { getLevelColors, getLevelIcon } from '@/shared/constants/theme';
import { appAlert } from '@/shared/utils/appAlert';
import moduleService from '@/services/moduleService';
import {
  StudyFocus,
  getStudyFocus,
  setStudyFocus,
  toStudyFocus,
  getFocusCandidates,
  buildCategoryNavParam,
} from '@/shared/utils/studyFocus';
import {
  getStudyRemindersPreferred,
  scheduleTestReminder,
  setStudyRemindersEnabled,
  updateReminderSchedule,
  resolveReminderClock,
  openAppNotificationSettings,
  getReminderEnableFailureReason,
  getReminderEnableFailureCopy,
} from '@/shared/services/studyReminders';
import {
  DEFAULT_REMINDER_HOUR,
  formatReminderTime,
  getStudyProfile,
  ReminderMode,
} from '@/shared/utils/studyProfile';
import ReminderScheduleControls from '@/shared/components/notification/ReminderScheduleControls';

interface LevelStatsProps {
  navigation: NavigationProp<any>;
}

type PlanState = {
  currentLevel: string;
  nextLevel: string;
  modulesCurrent: number;
  modulesRequired: number;
  modulesPercentage: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streak: number;
  completedModules: number;
};

const MIN_WEEKLY_GOAL = 1;
const MAX_WEEKLY_GOAL = 20;

export default function LevelStats({ navigation }: LevelStatsProps) {
  const { user, updateUser } = useAuth();
  const { level: themeLevel, chrome } = useLevelTheme();
  const [plan, setPlan] = useState<PlanState | null>(null);
  const [focus, setFocus] = useState<StudyFocus | null>(null);
  const [candidates, setCandidates] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderMode, setReminderMode] = useState<ReminderMode>('fixed');
  const [reminderHour, setReminderHour] = useState(DEFAULT_REMINDER_HOUR);
  const [savingReminders, setSavingReminders] = useState(false);
  const goalSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      const stats = await apiService.getUserStats(true);
      const modulesProgress = stats.levelProgress?.modulesProgress || {
        current: stats.completedModules || 0,
        required: 16,
        percentage: 0,
      };

      setPlan({
        currentLevel: stats.levelProgress?.current || stats.level || 'Aprendiz',
        nextLevel: stats.levelProgress?.next || 'Virtuoso',
        modulesCurrent: modulesProgress.current || 0,
        modulesRequired: modulesProgress.required || 16,
        modulesPercentage: Math.min(100, Math.max(0, modulesProgress.percentage || 0)),
        weeklyGoal: stats.weeklyGoal || stats.weeklyProgressDetail?.goal || 5,
        weeklyProgress: stats.weeklyProgress || stats.weeklyProgressDetail?.current || 0,
        streak: stats.currentStreak || stats.streak || 0,
        completedModules: stats.completedModules || 0,
      });

      if (user?.id) {
        const [savedFocus, nextCandidates, preferredReminders, studyProfile] = await Promise.all([
          getStudyFocus(user.id),
          getFocusCandidates(user.id, user.level || stats.level),
          getStudyRemindersPreferred(user.id),
          getStudyProfile(user.id),
        ]);
        setCandidates(nextCandidates);
        setRemindersEnabled(preferredReminders);
        const clock = resolveReminderClock(studyProfile);
        setReminderMode(studyProfile?.reminderMode === 'suggested' ? 'suggested' : 'fixed');
        setReminderHour(clock.hour);

        const stillValid =
          savedFocus &&
          !savedFocus.moduleId.startsWith('pending:') &&
          nextCandidates.some((module) => module.id === savedFocus.moduleId);

        if (stillValid && savedFocus) {
          setFocus(savedFocus);
        } else if (nextCandidates.length > 0) {
          const auto = toStudyFocus(nextCandidates[0]);
          await setStudyFocus(user.id, auto);
          setFocus(auto);
        } else {
          setFocus(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano de estudo:', error);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.level]);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
      return () => {
        if (goalSaveTimer.current) {
          clearTimeout(goalSaveTimer.current);
        }
      };
    }, [loadPlan])
  );

  const persistWeeklyGoal = async (goal: number) => {
    setSavingGoal(true);
    try {
      await updateUser({ weeklyGoal: goal });
    } catch (error: any) {
      appAlert('Não foi possível salvar', error?.message || 'Tente novamente.', [{ text: 'OK' }], {
        variant: 'error',
      });
      await loadPlan();
    } finally {
      setSavingGoal(false);
    }
  };

  const adjustWeeklyGoal = (delta: number) => {
    if (!plan) return;
    const next = Math.min(MAX_WEEKLY_GOAL, Math.max(MIN_WEEKLY_GOAL, plan.weeklyGoal + delta));
    if (next === plan.weeklyGoal) return;

    setPlan({ ...plan, weeklyGoal: next });

    if (goalSaveTimer.current) clearTimeout(goalSaveTimer.current);
    goalSaveTimer.current = setTimeout(() => {
      persistWeeklyGoal(next);
    }, 450);
  };

  const selectFocus = async (module: Module) => {
    if (!user?.id) return;

    // Revalida na hora: módulo já concluído não pode ser foco
    const completed = await moduleService.getCompletedModules(user.id);
    if (completed.includes(module.id)) {
      appAlert(
        'Módulo já concluído',
        'Escolha outro módulo pendente para o seu foco.',
        [{ text: 'OK' }],
        { variant: 'info' }
      );
      const nextCandidates = await getFocusCandidates(user.id, user.level);
      setCandidates(nextCandidates);
      return;
    }

    const next = toStudyFocus(module);
    await setStudyFocus(user.id, next);
    setFocus(next);
  };

  const continueStudying = async () => {
    if (!focus) {
      navigation.navigate('ModuleCategory');
      return;
    }

    try {
      setNavigating(true);
      const category = await buildCategoryNavParam(focus);
      navigation.navigate('ContentListCategory', { category });
    } catch (error) {
      console.error('Erro ao abrir foco de estudo:', error);
      navigation.navigate('ModuleCategory');
    } finally {
      setNavigating(false);
    }
  };

  const toggleReminders = async (enabled: boolean) => {
    if (!user?.id || !plan) return;

    setRemindersEnabled(enabled);
    setSavingReminders(true);
    try {
      const remaining = Math.max(0, plan.weeklyGoal - plan.weeklyProgress);
      const scheduled = await setStudyRemindersEnabled(user.id, enabled, {
        remainingModules: remaining,
        requestPermission: true,
      });

      if (enabled && !scheduled) {
        setRemindersEnabled(false);
        await setStudyRemindersEnabled(user.id, false);
        const reason = getReminderEnableFailureReason();
        if (!reason) return;
        const help = getReminderEnableFailureCopy(reason);
        appAlert(
          help.title,
          help.message,
          [
            { text: 'Agora não', style: 'cancel' },
            {
              text: 'Abrir configurações',
              onPress: () => {
                openAppNotificationSettings();
              },
            },
          ],
          { variant: 'warning' }
        );
        return;
      }

      await updateUser({
        notifications: {
          email: user.notifications?.email !== false,
          push: enabled,
        },
      });
    } catch (error: any) {
      setRemindersEnabled(!enabled);
      appAlert(
        'Não foi possível atualizar',
        error?.message || 'Tente novamente.',
        [{ text: 'OK' }],
        { variant: 'error' }
      );
    } finally {
      setSavingReminders(false);
    }
  };

  const applyReminderSchedule = async (patch: {
    reminderMode?: ReminderMode;
    reminderHour?: number;
  }) => {
    if (!user?.id || !plan || !remindersEnabled) return;
    setSavingReminders(true);
    try {
      const remaining = Math.max(0, plan.weeklyGoal - plan.weeklyProgress);
      await updateReminderSchedule(user.id, patch, { remainingModules: remaining });
      if (patch.reminderMode) setReminderMode(patch.reminderMode);
      if (typeof patch.reminderHour === 'number') setReminderHour(patch.reminderHour);
      if (patch.reminderMode === 'suggested') {
        const profile = await getStudyProfile(user.id);
        setReminderHour(resolveReminderClock(profile).hour);
      }
    } catch (error: any) {
      appAlert('Não foi possível atualizar o horário', error?.message || 'Tente novamente.', [
        { text: 'OK' },
      ], { variant: 'error' });
    } finally {
      setSavingReminders(false);
    }
  };

  const runDevTestReminder = async () => {
    try {
      const id = await scheduleTestReminder();
      if (id) {
        appAlert('Teste agendado', 'Lembrete de desenvolvimento em cerca de 1 minuto.', [{ text: 'OK' }], {
          variant: 'info',
        });
      } else {
        appAlert('Sem permissão', 'Permita notificações para testar o lembrete.', [{ text: 'OK' }], {
          variant: 'warning',
        });
      }
    } catch (error: any) {
      appAlert('Falha no teste', error?.message || 'Tente novamente.', [{ text: 'OK' }], {
        variant: 'error',
      });
    }
  };

  const isMaxLevel = (currentLevel: string) => {
    const n = currentLevel.toLowerCase();
    return n.includes('máximo') || n.includes('maximo') || n === 'maestro';
  };

  if (isLoading) {
    return (
      <LevelScreenShell level={themeLevel}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={chrome.primary} />
          <Text style={styles.loadingText}>Carregando seu plano...</Text>
        </View>
      </LevelScreenShell>
    );
  }

  if (!plan) {
    return (
      <LevelScreenShell level={themeLevel}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Não foi possível carregar o plano</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: chrome.primary }]} onPress={loadPlan}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      </LevelScreenShell>
    );
  }

  const currentLevelColors = getLevelColors(plan.currentLevel);
  const nextLevelColors = getLevelColors(plan.nextLevel);
  const levelIcon = getLevelIcon(plan.currentLevel);
  const weeklyPct = Math.min(100, Math.round((plan.weeklyProgress / Math.max(plan.weeklyGoal, 1)) * 100));
  const remainingWeek = Math.max(0, plan.weeklyGoal - plan.weeklyProgress);
  const remainingLevel = Math.max(0, plan.modulesRequired - plan.modulesCurrent);

  return (
    <LevelScreenShell level={themeLevel}>
      <View style={styles.container}>
        <ChromeNavHeader variant="title">
          <BackButton onPress={() => navigation.goBack()} level={themeLevel} />
          <Text style={[styles.headerTitle, { color: currentLevelColors.text }]}>Meu plano de estudo</Text>
        </ChromeNavHeader>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Nível */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: currentLevelColors.secondary,
                borderLeftColor: currentLevelColors.primary,
              },
            ]}
          >
            <MaterialCommunityIcons name={levelIcon as any} size={40} color={currentLevelColors.primary} />
            <View style={styles.heroText}>
              <Text style={[styles.heroLabel, { color: currentLevelColors.text }]}>Você é</Text>
              <Text style={[styles.heroTitle, { color: currentLevelColors.primary }]}>{plan.currentLevel}</Text>
            </View>
            <View style={styles.heroMeta}>
              <MaterialCommunityIcons name="fire" size={18} color={currentLevelColors.primary} />
              <Text style={[styles.heroMetaText, { color: currentLevelColors.text }]}>{plan.streak}d</Text>
            </View>
          </View>

          {/* Meta semanal */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-check" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Meta da semana</Text>
              {savingGoal ? <ActivityIndicator size="small" color={chrome.primary} /> : null}
            </View>
            <Text style={styles.cardHint}>
              {remainingWeek === 0
                ? 'Meta da semana concluída. Continue praticando!'
                : `Faltam ${remainingWeek} módulo${remainingWeek === 1 ? '' : 's'} esta semana (conta ao concluir o quiz do módulo)`}
            </Text>

            <View style={styles.goalControls}>
              <TouchableOpacity
                style={[styles.goalBtn, { borderColor: chrome.primary }]}
                onPress={() => adjustWeeklyGoal(-1)}
                disabled={plan.weeklyGoal <= MIN_WEEKLY_GOAL || savingGoal}
                accessibilityLabel="Diminuir meta semanal"
              >
                <MaterialCommunityIcons name="minus" size={22} color={chrome.primary} />
              </TouchableOpacity>
              <View style={styles.goalValueBox}>
                <Text style={[styles.goalValue, { color: chrome.primary }]}>{plan.weeklyGoal}</Text>
                <Text style={styles.goalUnit}>por semana</Text>
              </View>
              <TouchableOpacity
                style={[styles.goalBtn, { borderColor: chrome.primary }]}
                onPress={() => adjustWeeklyGoal(1)}
                disabled={plan.weeklyGoal >= MAX_WEEKLY_GOAL || savingGoal}
                accessibilityLabel="Aumentar meta semanal"
              >
                <MaterialCommunityIcons name="plus" size={22} color={chrome.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${weeklyPct}%`, backgroundColor: chrome.primary },
                ]}
              />
            </View>
            <Text style={styles.barCaption}>
              {plan.weeklyProgress} / {plan.weeklyGoal} · {weeklyPct}%
            </Text>
          </View>

          {/* Lembretes */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Lembretes de estudo</Text>
              {savingReminders ? <ActivityIndicator size="small" color={chrome.primary} /> : null}
              <Switch
                value={remindersEnabled}
                onValueChange={toggleReminders}
                disabled={savingReminders}
                trackColor={{ false: '#D5DEE5', true: '#C6E8FF' }}
                thumbColor={remindersEnabled ? chrome.primary : '#f4f3f4'}
              />
            </View>
            <Text style={styles.cardHint}>
              {remindersEnabled
                ? reminderMode === 'suggested'
                  ? `Sugestão do app · avisos por volta de ${formatReminderTime(reminderHour)}. Desative aqui ou em Conta quando quiser.`
                  : `Lembretes às ${formatReminderTime(reminderHour)} nos dias do seu plano. Desative aqui ou em Conta quando quiser.`
                : 'Desativado. Ative aqui ou em Conta para ser lembrado de estudar.'}
            </Text>
            <ReminderScheduleControls
              enabled={remindersEnabled}
              mode={reminderMode}
              hour={reminderHour}
              primaryColor={chrome.primary}
              disabled={savingReminders}
              onModeChange={(mode) => applyReminderSchedule({ reminderMode: mode })}
              onHourChange={(hour) =>
                applyReminderSchedule({ reminderMode: 'fixed', reminderHour: hour })
              }
            />
            {__DEV__ ? (
              <TouchableOpacity style={styles.devTestBtn} onPress={runDevTestReminder} activeOpacity={0.7}>
                <Text style={[styles.devTestText, { color: chrome.primary }]}>
                  [DEV] Testar lembrete em 1 min
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Próximo foco */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="target" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Meu próximo foco</Text>
            </View>
            <Text style={styles.cardHint}>
              Sugestão opcional: escolha um módulo pendente para priorizar. Você continua livre para estudar qualquer categoria.
            </Text>

            {focus ? (
              <View style={[styles.focusSelected, { borderColor: chrome.primary }]}>
                <Text style={styles.focusSelectedTitle}>{focus.moduleTitle}</Text>
                <Text style={styles.focusSelectedSub}>{focus.categoryName}</Text>
              </View>
            ) : (
              <Text style={styles.emptyFocus}>Nenhum módulo pendente — explore as categorias.</Text>
            )}

            {candidates.length > 0 ? (
              <View style={styles.candidateList}>
                {candidates.map((module) => {
                  const selected = focus?.moduleId === module.id;
                  return (
                    <TouchableOpacity
                      key={module.id}
                      style={[
                        styles.candidateChip,
                        selected && { backgroundColor: chrome.primary, borderColor: chrome.primary },
                      ]}
                      onPress={() => selectFocus(module)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[styles.candidateChipText, selected && styles.candidateChipTextSelected]}
                        numberOfLines={2}
                      >
                        {module.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: chrome.primary }]}
              onPress={continueStudying}
              disabled={navigating || !focus}
              activeOpacity={0.85}
            >
              {navigating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="play-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.continueBtnText}>
                    {focus ? 'Continuar no foco escolhido' : 'Selecione um foco acima'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.freeExploreBtn}
              onPress={() => navigation.navigate('ModuleCategory')}
              activeOpacity={0.7}
            >
              <Text style={[styles.freeExploreText, { color: chrome.primary }]}>
                Explorar todas as categorias livremente
              </Text>
            </TouchableOpacity>
          </View>

          {/* Caminho de nível */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trending-up" size={22} color={nextLevelColors.primary} />
              <Text style={styles.cardTitle}>
                {isMaxLevel(plan.currentLevel) ? 'Nível máximo' : `Caminho para ${plan.nextLevel}`}
              </Text>
            </View>
            {!isMaxLevel(plan.currentLevel) ? (
              <>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${plan.modulesPercentage}%`,
                        backgroundColor: nextLevelColors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCaption}>
                  {plan.modulesCurrent} / {plan.modulesRequired} módulos
                  {remainingLevel > 0 ? ` · faltam ${remainingLevel}` : ''}
                </Text>
              </>
            ) : (
              <Text style={styles.cardHint}>
                Você concluiu a trilha de níveis. Mantenha a prática com a meta semanal e o desafio diário.
              </Text>
            )}
            <Text style={styles.secondaryStat}>{plan.completedModules} módulos concluídos no total</Text>
          </View>
        </ScrollView>
      </View>
    </LevelScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 72,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  heroText: {
    flex: 1,
    marginLeft: 12,
  },
  heroLabel: {
    fontSize: 13,
    opacity: 0.85,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 14,
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
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#232323',
  },
  cardHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 14,
  },
  goalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 16,
  },
  goalBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalValueBox: {
    alignItems: 'center',
    minWidth: 88,
  },
  goalValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  goalUnit: {
    fontSize: 12,
    color: '#666',
  },
  barTrack: {
    height: 10,
    backgroundColor: '#E8EEF2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barCaption: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  focusSelected: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F7FBFE',
  },
  focusSelectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#232323',
  },
  focusSelectedSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyFocus: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  candidateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  candidateChip: {
    borderWidth: 1,
    borderColor: '#D5DEE5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
    backgroundColor: '#FFF',
  },
  candidateChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  candidateChipTextSelected: {
    color: '#FFF',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  freeExploreBtn: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  freeExploreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryStat: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
  },
  devTestBtn: {
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  devTestText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
