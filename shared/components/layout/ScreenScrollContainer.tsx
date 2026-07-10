import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenScrollContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Ativa KeyboardAvoidingView (telas com formulário). */
  keyboardAvoiding?: boolean;
  /** Espaço extra abaixo do conteúdo (ex.: menu inferior). */
  bottomInset?: number;
  keyboardVerticalOffset?: number;
};

/**
 * Container scrollável padrão para telas cujo conteúdo pode ultrapassar a viewport.
 */
const ScreenScrollContainer: React.FC<ScreenScrollContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardAvoiding = false,
  bottomInset = 0,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 64 : 0,
}) => {
  const insets = useSafeAreaInsets();

  const scrollView = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, bottomInset),
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={[{ flex: 1 }, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {scrollView}
      </KeyboardAvoidingView>
    );
  }

  return <View style={[{ flex: 1 }, style]}>{scrollView}</View>;
};

export default ScreenScrollContainer;
