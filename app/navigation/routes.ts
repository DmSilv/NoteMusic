export const ROUTES = {
  SelectionScreen: 'SelectionScreen',
  LoginScreen: 'LoginScreen',
  RegisterUser: 'RegisterUser',
  RemenberPassword: 'RemenberPassword',
  ResetPassword: 'ResetPassword',
  SelectLevelPerson: 'SelectLevelPerson',
  AppIntroScreen: 'AppIntroScreen',
  ProfileHome: 'ProfileHome',
  ProfileAccount: 'ProfileAccount',
  ModuleCategory: 'ModuleCategory',
  Quiz: 'Quiz',
  QuizResults: 'QuizResults',
  ContentListCategory: 'ContentListCategory',
  QuizIntroScreen: 'QuizIntroScreen',
  ChangePassword: 'ChangePassword',
  LevelStats: 'LevelStats',
  AccountDeletion: 'AccountDeletion',
  DeactivatedAccount: 'DeactivatedAccount',
} as const;

export type RouteName = keyof typeof ROUTES;
