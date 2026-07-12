import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  DEFAULT_REMINDER_HOUR,
  formatReminderTime,
  ReminderMode,
  REMINDER_TIME_PRESETS,
} from '@/shared/utils/studyProfile';

type ReminderScheduleControlsProps = {
  enabled: boolean;
  mode: ReminderMode;
  hour: number;
  primaryColor: string;
  onModeChange: (mode: ReminderMode) => void;
  onHourChange: (hour: number) => void;
  disabled?: boolean;
};

export default function ReminderScheduleControls({
  enabled,
  mode,
  hour,
  primaryColor,
  onModeChange,
  onHourChange,
  disabled,
}: ReminderScheduleControlsProps) {
  if (!enabled) return null;

  const displayHour = hour || DEFAULT_REMINDER_HOUR;

  return (
    <View style={styles.wrap}>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeChip,
            mode === 'fixed' && { backgroundColor: primaryColor, borderColor: primaryColor },
          ]}
          onPress={() => onModeChange('fixed')}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeChipText, mode === 'fixed' && styles.modeChipTextOn]}>
            Horário fixo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeChip,
            mode === 'suggested' && { backgroundColor: primaryColor, borderColor: primaryColor },
          ]}
          onPress={() => onModeChange('suggested')}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeChipText, mode === 'suggested' && styles.modeChipTextOn]}>
            Sugestão do app
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'fixed' ? (
        <View style={styles.hoursRow}>
          {REMINDER_TIME_PRESETS.map((preset) => {
            const selected = displayHour === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.hourChip,
                  selected && { backgroundColor: primaryColor, borderColor: primaryColor },
                ]}
                onPress={() => onHourChange(preset)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <Text style={[styles.hourChipText, selected && styles.hourChipTextOn]}>
                  {formatReminderTime(preset)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={styles.suggestedHint}>
          Usamos o horário em que você costuma estudar (ou{' '}
          {formatReminderTime(DEFAULT_REMINDER_HOUR)} se ainda não houver histórico).
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5DEE5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  modeChipTextOn: {
    color: '#FFF',
  },
  hoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    borderWidth: 1,
    borderColor: '#D5DEE5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  hourChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  hourChipTextOn: {
    color: '#FFF',
  },
  suggestedHint: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
});
