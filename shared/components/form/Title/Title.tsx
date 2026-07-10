import React from 'react';
import { Text, View, TextStyle, ViewStyle } from 'react-native';
import styles from './Style';

interface TitleProps {
  title: string;
  subtitle?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number | string;
  truncate?: boolean;
  /** Sobrescreve o número de linhas exibidas (padrão: 2 quando truncate, ilimitado quando não). */
  numberOfLines?: number;
  /** Permite que o texto encolha dentro de um container flex (útil em headers com largura variável). */
  shrink?: boolean;
  FontFamily?: string;
  MarginRight?: number;
  MarginTop?: number;
}

const TitleComponent: React.FC<TitleProps> = ({
  title,
  subtitle,
  color,
  fontFamily,
  fontSize,
  truncate = true,
  numberOfLines,
  shrink = false,
  FontFamily,
  MarginRight,
  MarginTop,
}) => {
  const resolvedFontFamily = fontFamily || FontFamily || 'Roboto';
  const resolvedFontSize = typeof fontSize === 'number' ? fontSize : fontSize ? Number(fontSize) || 24 : 24;
  const resolvedNumberOfLines = numberOfLines ?? (truncate ? 2 : undefined);
  // Corte por caractere só entra quando não há um limite de linhas fazendo o
  // trabalho (numberOfLines + ellipsizeMode já cortam pelo espaço disponível,
  // o que é mais confiável em telas de tamanhos diferentes do que um número
  // fixo de caracteres).
  const displayTitle =
    truncate && !numberOfLines && title && title.length > 20 ? title.substring(0, 20) + '...' : title;

  return (
    <View
      style={[
        styles.titleContainer,
        MarginTop != null && { marginTop: MarginTop },
        shrink && ({ flexShrink: 1, minWidth: 0 } as ViewStyle),
      ]}
    >
      <Text
        style={[
          styles.Title,
          {
            color: color || '#0087D3',
            fontFamily: resolvedFontFamily,
            fontSize: resolvedFontSize,
            marginRight: MarginRight ?? 0,
          } as TextStyle,
          shrink && ({ flexShrink: 1 } as TextStyle),
        ]}
        numberOfLines={resolvedNumberOfLines}
        ellipsizeMode={resolvedNumberOfLines != null ? 'tail' : undefined}
      >
        {displayTitle}
      </Text>
      {subtitle ? (
        <Text style={{ color: '#A3A3A3', fontSize: 14, marginTop: 4, fontFamily: 'Roboto-Light' }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export default TitleComponent;
