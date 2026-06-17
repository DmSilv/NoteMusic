import React from 'react';
import { Text, View } from 'react-native';
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
}) => {
  return (
    <View style={[styles.subtitleContainer, { marginTop: marginTop ?? MarginTop ?? 8 }]}>
      <Text
        style={[
          styles.SubTitle,
          {
            color: color || '#A3A3A3',
            fontFamily: fontFamily || FontFamily || 'System',
            marginRight: marginRight ?? MarginRight ?? 0,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

export default SubTitleComponent;
