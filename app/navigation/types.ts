import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.SelectionScreen]: undefined;
  [ROUTES.LoginScreen]: undefined;
  [ROUTES.RegisterUser]: undefined;
  [ROUTES.RemenberPassword]: undefined;
  [ROUTES.ResetPassword]: { email?: string } | undefined;
  [ROUTES.SelectLevelPerson]: undefined;
  [ROUTES.ProfileHome]: undefined;
  [ROUTES.ProfileAccount]: undefined;
  [ROUTES.ModuleCategory]: undefined;
  [ROUTES.Quiz]: { quizId: string; moduleId: string; level?: string };
  [ROUTES.QuizResults]: { quizId: string; moduleId: string; score?: number };
  [ROUTES.ContentListCategory]: { moduleId: string; moduleName?: string; level?: string };
  [ROUTES.QuizIntroScreen]: { quizId?: string; moduleId: string; level?: string; quizTitle?: string };
  [ROUTES.ChangePassword]: undefined;
  [ROUTES.LevelStats]: undefined;
  [ROUTES.AccountDeletion]: undefined;
  [ROUTES.DeactivatedAccount]: { email?: string; deletionScheduledFor?: string; deletionReason?: string };
};
