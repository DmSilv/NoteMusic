import React from 'react';
import { Text, View, TextStyle, ViewStyle } from 'react-native';
import styles from './Style';

interface SubTitleProps {
  subtitle: string;
  color?: string;
  fontFamily?: string;
  marginRight?: number;
  marginTop?: number;
  FontFamily?: string;
  MarginRight?: number;
  MarginTop?: number;
  /** Limita o texto a N linhas (com "..." no final) — útil em containers com largura variável. */
  numberOfLines?: number;
  /** Permite que o texto encolha dentro de um container flex em vez de empurrar outros elementos. */
  shrink?: boolean;
}

const SubTitleComponent: React.FC<SubTitleProps> = ({
  subtitle,
  color,
  fontFamily,
  marginRight,
  marginTop,
  FontFamily,
  MarginRight,
  MarginTop,
  numberOfLines,
  shrink = false,
}) => {
  return (
    <View
      style={[
        styles.subtitleContainer,
        { marginTop: marginTop ?? MarginTop ?? 8 },
        shrink && ({ flexShrink: 1, minWidth: 0 } as ViewStyle),
      ]}
    >
      <Text
        style={[
          styles.SubTitle,
          {
            color: color || '#A3A3A3',
            fontFamily: fontFamily || FontFamily || 'System',
            marginRight: marginRight ?? MarginRight ?? 0,
          },
          shrink && ({ flexShrink: 1 } as TextStyle),
        ]}
        numberOfLines={numberOfLines}
        ellipsizeMode={numberOfLines != null ? 'tail' : undefined}
      >
        {subtitle}
      </Text>
    </View>
  );
};

export default SubTitleComponent;
