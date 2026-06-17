import React from 'react';
import { Text, View, TextStyle } from 'react-native';
import styles from './Style';

interface TitleProps {
  title: string;
  subtitle?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number | string;
  truncate?: boolean;
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
  FontFamily,
  MarginRight,
  MarginTop,
}) => {
  const resolvedFontFamily = fontFamily || FontFamily || 'Roboto';
  const resolvedFontSize = typeof fontSize === 'number' ? fontSize : fontSize ? Number(fontSize) || 24 : 24;
  const displayTitle =
    truncate && title && title.length > 20 ? title.substring(0, 20) + '...' : title;

  return (
    <View style={[styles.titleContainer, MarginTop != null && { marginTop: MarginTop }]}>
      <Text
        style={[
          styles.Title,
          {
            color: color || '#0087D3',
            fontFamily: resolvedFontFamily,
            fontSize: resolvedFontSize,
            marginRight: MarginRight ?? 0,
          } as TextStyle,
        ]}
        numberOfLines={truncate ? 2 : undefined}
        ellipsizeMode={truncate ? 'tail' : undefined}
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
