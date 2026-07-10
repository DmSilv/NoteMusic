import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PaginationDotsProps {
  total: number;
  currentIndex: number;
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Indicador de progresso em "dots" — usado em carrosséis/telas em etapas
 * (ex.: apresentação do app). O dot ativo fica mais largo para ficar claro
 * qual etapa está selecionada mesmo em telas pequenas.
 */
const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  currentIndex,
  activeColor = '#0087D3',
  inactiveColor = '#D9E6F2',
}) => {
  if (total <= 1) return null;

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={`Etapa ${currentIndex + 1} de ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          testID={`pagination-dot-${index}`}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? activeColor : inactiveColor,
              width: index === currentIndex ? 22 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default PaginationDots;
