import React, { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppAlertButton, AppAlertOptions, AppAlertVariant } from '@/shared/utils/appAlert';

const MUSIC_NOTE = require('@/assets/images/music-note.png');

type AppDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  options?: AppAlertOptions;
  onRequestClose: () => void;
  onButtonPress: (button: AppAlertButton) => void;
};

const VARIANT_CONFIG: Record<
  AppAlertVariant,
  { color: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; useNote?: boolean }
> = {
  default: { color: '#0087D3', icon: 'information-outline' },
  info: { color: '#0087D3', icon: 'information-outline' },
  success: { color: '#2E7D32', icon: 'check-circle-outline' },
  error: { color: '#DC3545', icon: 'alert-circle-outline' },
  warning: { color: '#F59E0B', icon: 'alert-outline' },
  goodbye: { color: '#0087D3', icon: 'music', useNote: true },
};

function inferVariant(
  title: string,
  buttons: AppAlertButton[],
  explicit?: AppAlertVariant
): AppAlertVariant {
  if (explicit) return explicit;

  const hasDestructive = buttons.some((b) => b.style === 'destructive');
  const lower = title.toLowerCase();

  if (hasDestructive && /(excluir|sair|remover|apagar|deletar)/i.test(title)) {
    return 'error';
  }
  if (/sucesso|ativado|pronto|conclu/i.test(lower)) return 'success';
  if (/erro|falha|ops|invalid/i.test(lower)) return 'error';
  if (/aviso|atenção|atencao|cuidado|cooldown/i.test(lower)) return 'warning';
  if (/até logo|ate logo/i.test(lower)) return 'goodbye';

  return hasDestructive ? 'warning' : 'default';
}

export default function AppDialog({
  visible,
  title,
  message,
  buttons,
  options,
  onRequestClose,
  onButtonPress,
}: AppDialogProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const variant = inferVariant(title, buttons, options?.variant);
  const config = VARIANT_CONFIG[variant];
  const accent = options?.accentColor || config.color;
  const cancelable = options?.cancelable !== false;

  const orderedButtons = useMemo(() => {
    if (!buttons.length) {
      return [{ text: 'OK', style: 'default' as const }];
    }
    return buttons;
  }, [buttons]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible, opacity, scale]);

  const primaryButton =
    variant === 'goodbye'
      ? orderedButtons.find((b) => b.style === 'cancel') || orderedButtons[0]
      : [...orderedButtons].reverse().find((b) => b.style !== 'cancel') ||
        orderedButtons[orderedButtons.length - 1];
  const secondaryButtons = orderedButtons.filter((b) => b !== primaryButton);

  const primaryIsDestructive = primaryButton?.style === 'destructive';
  const primaryColor = primaryIsDestructive ? '#DC3545' : accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (cancelable) onRequestClose();
      }}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          {cancelable ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={onRequestClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            />
          ) : (
            <View style={StyleSheet.absoluteFill} />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
              borderTopColor: accent,
            },
          ]}
        >
          <View style={[styles.iconRing, { backgroundColor: `${accent}18` }]}>
            {config.useNote ? (
              <Image source={MUSIC_NOTE} style={styles.noteIcon} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name={config.icon} size={30} color={accent} />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message ? (
            <Text style={styles.message}>{message}</Text>
          ) : (
            <View style={styles.messageSpacer} />
          )}

          {primaryButton && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: primaryColor }]}
              onPress={() => onButtonPress(primaryButton)}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{primaryButton.text}</Text>
            </TouchableOpacity>
          )}

          {secondaryButtons.map((button, index) => {
            const isDestructive = button.style === 'destructive';
            return (
              <TouchableOpacity
                key={`${button.text}-${index}`}
                style={styles.secondaryButton}
                onPress={() => onButtonPress(button)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDestructive ? '#DC3545' : accent },
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noteIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Medium',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Roboto-Light',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 22,
  },
  messageSpacer: {
    height: 14,
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 14,
    marginBottom: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
});
