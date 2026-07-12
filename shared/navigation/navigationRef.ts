import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/app/navigation/types';
import { ROUTES } from '@/app/navigation/routes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToLevelStats(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(ROUTES.LevelStats);
  }
}
