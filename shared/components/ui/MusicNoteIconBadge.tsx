import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LevelColors } from '@/shared/constants/theme';

const NOTE_ICON = require('@/assets/images/music-note.png');

const BADGE_SIZE = 28;
const ICON_SIZE = 16;
const BADGE_PADDING = 4;
const BADGE_RADIUS = 8;

type MusicNoteIconBadgeProps = {
  /** Apenas espaçamento externo do badge (ex.: margin). Não altera o visual interno. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Badge padronizado do ícone de nota musical (fundo claro + nota).
 * Usar em cards de categoria, módulos e demais listagens.
 */
const MusicNoteIconBadge: React.FC<MusicNoteIconBadgeProps> = ({ style }) => {
  return (
    <View style={[styles.badge, style]}>
      <Image source={NOTE_ICON} style={styles.icon} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    backgroundColor: LevelColors.aprendiz.accent,
    borderRadius: BADGE_RADIUS,
    padding: BADGE_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});

export default MusicNoteIconBadge;
