// declarations.d.ts

// Declarações para tipos de arquivos de imagem
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

// Declaração para o ProgressBarAndroid
declare module '@react-native-community/progress-bar-android' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface ProgressBarAndroidProps extends ViewProps {
    styleAttr?: 'Horizontal' | 'Small' | 'Large';
    indeterminate?: boolean;
    progress?: number;
  }

  export default class ProgressBarAndroid extends Component<ProgressBarAndroidProps> {}
}
