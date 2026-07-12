import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { appAlert } from '@/shared/utils/appAlert';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ChromeNavHeader from '@/shared/components/layout/ChromeNavHeader';
import useLevelTheme from '@/shared/hooks/useLevelTheme';
import useResponsiveLayout from '@/shared/hooks/useResponsiveLayout';
import eyeIcon from '@/assets/images/eye.png';
import eyeOffIcon from '@/assets/images/eye-off.png';
import PrimaryButton from '@/shared/components/form/PrimaryButton/PrimaryButton';
import Input from '@/shared/components/form/Input/Input';
import MenuBottom, { getMenuBottomHeight } from '@/shared/components/layout/MenuBottom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail, validateName } from '@/shared/utils/validation';
import { confirmExitApp } from '@/shared/utils/exitApp';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLevelColors, getLevelIcon } from '@/shared/constants/theme';
import {
  getStudyRemindersPreferred,
  resolveReminderClock,
  setStudyRemindersEnabled,
  updateReminderSchedule,
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

interface ProfileAccountProps {
  navigation: NativeStackNavigationProp<any>;
}

const ProfileAccount: React.FC<ProfileAccountProps> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { formFieldWidth, horizontalPadding } = useResponsiveLayout();
  const {
    user,
    logout,
    updateUser,
    biometricHardwareAvailable,
    biometricLoginEnabled,
    biometricTypeLabel,
    enableBiometricLogin,
    disableBiometricLogin,
  } = useAuth();
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderMode, setReminderMode] = useState<ReminderMode>('fixed');
  const [reminderHour, setReminderHour] = useState(DEFAULT_REMINDER_HOUR);
  const [isTogglingReminders, setIsTogglingReminders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { level: themeLevel, chrome, colors: levelColors } = useLevelTheme();
  const insets = useSafeAreaInsets();
  const levelIcon = getLevelIcon(user?.level || themeLevel);
  const displayLevelColors = getLevelColors(user?.level || themeLevel);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        setRemindersEnabled(false);
        setReminderMode('fixed');
        setReminderHour(DEFAULT_REMINDER_HOUR);
        return;
      }
      Promise.all([getStudyRemindersPreferred(user.id), getStudyProfile(user.id)])
        .then(([preferred, profile]) => {
          setRemindersEnabled(preferred);
          const clock = resolveReminderClock(profile);
          setReminderMode(profile?.reminderMode === 'suggested' ? 'suggested' : 'fixed');
          setReminderHour(clock.hour);
        })
        .catch(() => setRemindersEnabled(false));
    }, [user?.id])
  );

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollViewRef.current?.scrollTo({ y: 10000, animated: true });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (formData.name.trim()) {
      const nameValidation = validateName(formData.name);
      if (!nameValidation.isValid) {
        newErrors.name = nameValidation.error || 'Nome inválido';
        isValid = false;
      } else {
        newErrors.name = '';
      }
    } else {
      newErrors.name = '';
    }

    if (formData.email.trim()) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'E-mail inválido';
        isValid = false;
      } else {
        newErrors.email = '';
      }
    } else {
      newErrors.email = '';
    }

    const isChangingEmailOrPassword =
      (formData.email.trim() && formData.email !== user?.email) || formData.newPassword.trim();
    if (isChangingEmailOrPassword && !formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória para alterar email ou senha';
      isValid = false;
    } else if (formData.currentPassword.trim() && formData.currentPassword.length < 6) {
      newErrors.currentPassword = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    } else {
      newErrors.currentPassword = '';
    }

    if (formData.newPassword.trim() && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
      isValid = false;
    } else {
      newErrors.newPassword = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const hasChanges = () =>
    (formData.name.trim() && formData.name !== user?.name) ||
    (formData.email.trim() && formData.email !== user?.email) ||
    !!formData.currentPassword.trim() ||
    !!formData.newPassword.trim();

  const handleUpdateAccount = async () => {
    if (!validateForm()) {
      appAlert('Erro de Validação', 'Por favor, corrija os erros nos campos.');
      return;
    }
    if (!hasChanges()) {
      appAlert('Aviso', 'Nenhuma alteração foi feita nos campos.');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Record<string, string> = {};
      if (formData.name.trim() && formData.name !== user?.name) {
        updateData.name = formData.name.trim();
      }
      if (formData.email.trim() && formData.email !== user?.email) {
        updateData.email = formData.email.trim();
      }
      if (formData.currentPassword.trim()) {
        updateData.currentPassword = formData.currentPassword.trim();
      }
      if (formData.newPassword.trim()) {
        updateData.newPassword = formData.newPassword.trim();
      }

      await updateUser(updateData);
      appAlert('Sucesso', 'Conta atualizada com sucesso!');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      appAlert('Erro', error.message || 'Não foi possível atualizar a conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (isTogglingBiometric) return;
    setIsTogglingBiometric(true);
    try {
      if (value) {
        await enableBiometricLogin();
        appAlert('Ativado!', `Agora você pode entrar usando ${biometricTypeLabel}.`);
      } else {
        await disableBiometricLogin();
      }
    } catch (error: any) {
      appAlert('Ops!', error.message || 'Não foi possível atualizar a configuração de biometria.');
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const handleToggleReminders = async (enabled: boolean) => {
    if (!user?.id || isTogglingReminders) return;
    setRemindersEnabled(enabled);
    setIsTogglingReminders(true);
    try {
      const scheduled = await setStudyRemindersEnabled(user.id, enabled, {
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
      if (!enabled) {
        appAlert('Lembretes desativados', 'Você não receberá mais avisos de estudo neste aparelho.', [
          { text: 'OK' },
        ]);
      }
    } catch (error: any) {
      setRemindersEnabled(!enabled);
      appAlert('Ops!', error?.message || 'Não foi possível atualizar as notificações.');
    } finally {
      setIsTogglingReminders(false);
    }
  };

  const applyReminderSchedule = async (patch: {
    reminderMode?: ReminderMode;
    reminderHour?: number;
  }) => {
    if (!user?.id || !remindersEnabled || isTogglingReminders) return;
    setIsTogglingReminders(true);
    try {
      await updateReminderSchedule(user.id, patch);
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
      setIsTogglingReminders(false);
    }
  };

  const handleLogout = () => {
    appAlert('Sair da conta', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'SelectionScreen' }] });
        },
      },
    ]);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'name':
        if (value.trim()) {
          const nameValidation = validateName(value);
          if (!nameValidation.isValid) error = nameValidation.error || 'Nome inválido';
        }
        break;
      case 'email':
        if (value.trim()) {
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid) error = emailValidation.error || 'E-mail inválido';
        }
        break;
      case 'currentPassword':
        if (value.trim() && value.length < 6) error = 'Senha deve ter pelo menos 6 caracteres';
        break;
      case 'newPassword':
        if (value.trim() && value.length < 6) error = 'Nova senha deve ter pelo menos 6 caracteres';
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'name' && value.length > 15) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const fieldWidth = { width: '100%' as const };

  return (
    <LevelScreenShell level={themeLevel}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ChromeNavHeader variant="title">
          <Text style={[styles.headerTitle, { color: displayLevelColors.text }]}>Conta</Text>
        </ChromeNavHeader>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
            !keyboardVisible && { paddingBottom: getMenuBottomHeight(insets.bottom) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: displayLevelColors.secondary,
                borderLeftColor: displayLevelColors.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={levelIcon as any}
              size={40}
              color={displayLevelColors.primary}
            />
            <View style={styles.heroText}>
              <Text style={[styles.heroLabel, { color: displayLevelColors.text }]}>Olá</Text>
              <Text style={[styles.heroTitle, { color: displayLevelColors.primary }]} numberOfLines={1}>
                {user?.name || 'Músico'}
              </Text>
              <Text style={styles.heroMeta} numberOfLines={1}>
                {user?.level || 'Aprendiz'}
                {user?.email ? ` · ${user.email}` : ''}
              </Text>
            </View>
          </View>

          {/* Dados */}
          <View style={[styles.card, { maxWidth: formFieldWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="account-edit-outline" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Dados da conta</Text>
            </View>
            <Text style={styles.cardHint}>
              Altere só o que precisar. Para mudar o e-mail, informe também a senha atual.
            </Text>

            <Text style={styles.fieldLabel}>Nome</Text>
            <Input
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Primeiro nome (máx. 15)"
              secureTextEntry={false}
              styleWidth={fieldWidth}
              value={formData.name}
              error={errors.name}
              maxLength={15}
            />

            <Text style={styles.fieldLabel}>E-mail</Text>
            <Input
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Digite seu e-mail"
              secureTextEntry={false}
              styleWidth={fieldWidth}
              value={formData.email}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <PrimaryButton
              onPress={handleUpdateAccount}
              styleWidth={fieldWidth}
              title={hasChanges() ? 'Salvar alterações' : 'Nenhuma alteração'}
              loading={isLoading}
              disabled={isLoading || !hasChanges()}
              style={styles.saveButton}
            />
          </View>

          {/* Segurança */}
          <View style={[styles.card, { maxWidth: formFieldWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="lock-outline" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Segurança</Text>
            </View>
            <Text style={styles.cardHint}>
              Use a senha atual para confirmar troca de e-mail ou definição de nova senha.
            </Text>

            <Text style={styles.fieldLabel}>Senha atual</Text>
            <View style={styles.passwordContainer}>
              <Input
                onChangeText={(text) => handleInputChange('currentPassword', text)}
                placeholder="Digite sua senha atual"
                secureTextEntry={!showCurrentPassword}
                styleWidth={fieldWidth}
                value={formData.currentPassword}
                error={errors.currentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIconContainer}
                accessibilityLabel={showCurrentPassword ? 'Ocultar senha atual' : 'Mostrar senha atual'}
              >
                <Image source={showCurrentPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Nova senha</Text>
            <View style={styles.passwordContainer}>
              <Input
                onChangeText={(text) => handleInputChange('newPassword', text)}
                placeholder="Crie uma nova senha"
                secureTextEntry={!showNewPassword}
                styleWidth={fieldWidth}
                value={formData.newPassword}
                error={errors.newPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIconContainer}
                accessibilityLabel={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
              >
                <Image source={showNewPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferências */}
          <View style={[styles.card, { maxWidth: formFieldWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="tune-variant" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Preferências</Text>
            </View>

            <View style={styles.prefRow}>
              <MaterialCommunityIcons
                name={remindersEnabled ? 'bell-ring-outline' : 'bell-off-outline'}
                size={22}
                color={chrome.primary}
              />
              <View style={styles.prefText}>
                <Text style={styles.prefTitle}>Lembretes de estudo</Text>
                <Text style={styles.prefHint}>
                  {remindersEnabled
                    ? reminderMode === 'suggested'
                      ? `Ativo · sugestão ~${formatReminderTime(reminderHour)}`
                      : `Ativo · avisos às ${formatReminderTime(reminderHour)}`
                    : 'Desativado · ligue quando quiser ser lembrado'}
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={handleToggleReminders}
                disabled={isTogglingReminders || !user?.id}
                trackColor={{ false: '#D5DEE5', true: '#C6E8FF' }}
                thumbColor={remindersEnabled ? chrome.primary : '#f4f3f4'}
                accessibilityLabel="Ativar ou desativar lembretes de estudo"
              />
            </View>

            <ReminderScheduleControls
              enabled={remindersEnabled}
              mode={reminderMode}
              hour={reminderHour}
              primaryColor={chrome.primary}
              disabled={isTogglingReminders}
              onModeChange={(mode) => applyReminderSchedule({ reminderMode: mode })}
              onHourChange={(hour) =>
                applyReminderSchedule({ reminderMode: 'fixed', reminderHour: hour })
              }
            />

            {biometricHardwareAvailable ? (
              <View style={[styles.prefRow, styles.prefRowLast]}>
                <MaterialCommunityIcons name="fingerprint" size={22} color={chrome.primary} />
                <View style={styles.prefText}>
                  <Text style={styles.prefTitle}>Entrar com {biometricTypeLabel}</Text>
                  <Text style={styles.prefHint}>Acesso rápido sem digitar a senha</Text>
                </View>
                <Switch
                  value={biometricLoginEnabled}
                  onValueChange={handleToggleBiometric}
                  disabled={isTogglingBiometric}
                  trackColor={{ false: '#D5DEE5', true: '#C6E8FF' }}
                  thumbColor={biometricLoginEnabled ? chrome.primary : '#f4f3f4'}
                  accessibilityLabel={`Ativar ou desativar login com ${biometricTypeLabel}`}
                />
              </View>
            ) : null}
          </View>

          {/* Conta */}
          <View style={[styles.card, { maxWidth: formFieldWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="cog-outline" size={22} color={chrome.primary} />
              <Text style={styles.cardTitle}>Conta</Text>
            </View>

            <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
              <MaterialCommunityIcons name="logout-variant" size={22} color="#555" />
              <Text style={styles.actionRowText}>Sair da conta</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowLast]}
              onPress={() => {
                appAlert(
                  'Excluir Conta',
                  'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Continuar',
                      style: 'destructive',
                      onPress: () => navigation.navigate('AccountDeletion'),
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="delete-outline" size={22} color="#DC3545" />
              <Text style={styles.actionDeleteText}>Excluir minha conta</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#DC3545" />
            </TouchableOpacity>
          </View>

          <View style={styles.closeAppSection}>
            <Text style={styles.closeAppHint}>Sempre que quiser, sua música te espera aqui.</Text>
            <TouchableOpacity
              style={[styles.closeAppButton, { borderColor: `${levelColors.primary}33` }]}
              onPress={confirmExitApp}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Fechar aplicativo"
            >
              <MaterialCommunityIcons
                name="music-note-off-outline"
                size={18}
                color={levelColors.primary}
              />
              <Text style={[styles.closeAppButtonText, { color: levelColors.primary }]}>
                Fechar aplicativo
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!keyboardVisible ? (
          <MenuBottom
            current="profile"
            level={themeLevel}
            goHome={() => navigation.navigate('ProfileHome')}
            goProfile={() => {}}
          />
        ) : null}
      </KeyboardAvoidingView>
    </LevelScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
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
    fontSize: 13,
    color: '#555',
    marginTop: 2,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 0,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F5',
    gap: 10,
  },
  prefRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  prefText: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#232323',
  },
  prefHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F5',
    gap: 10,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionRowText: {
    flex: 1,
    fontSize: 15,
    color: '#232323',
    fontWeight: '500',
  },
  actionDeleteText: {
    flex: 1,
    fontSize: 15,
    color: '#DC3545',
    fontWeight: '500',
  },
  closeAppSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  closeAppHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 12,
  },
  closeAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
  },
  closeAppButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProfileAccount;
