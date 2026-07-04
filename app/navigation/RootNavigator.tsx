import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';

import SelectionScreen from '@/features/onboarding/screens/SelectionScreen/SelectionScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterUser from '@/features/auth/screens/RegisterUser/RegisterUser';
import RemenberPassword from '@/features/auth/screens/RemenberPassword';
import ResetPassword from '@/features/auth/screens/ResetPassword/ResetPassword';
import SelectLevelPerson from '@/features/onboarding/screens/SelectLevelPerson/SelectLevelPerson';
import ProfileHome from '@/features/profile/screens/ProfileHome/profileHome';
import ProfileAccount from '@/features/profile/screens/ProfileAccount/ProfileAccount';
import ModuleCategory from '@/features/modules/screens/ModuleCategory/ModuleCategory';
import Quiz from '@/features/quiz/screens/Quiz/Quiz';
import QuizResults from '@/features/quiz/screens/QuizResults';
import ContentListCategory from '@/features/modules/screens/ContentListCategory/ContentListCategory';
import QuizIntroScreen from '@/features/quiz/screens/QuizIntroScreen/QuizIntroScreen';
import ChangePassword from '@/features/auth/screens/ChangePassword/ChangePassword';
import LevelStats from '@/features/profile/screens/LevelStats/LevelStats';
import AccountDeletion from '@/features/account/screens/AccountDeletion';
import DeactivatedAccount from '@/features/account/screens/DeactivatedAccount';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name={ROUTES.SelectionScreen} component={SelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.LoginScreen} component={LoginScreen} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name={ROUTES.RegisterUser} component={RegisterUser} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
        <Stack.Screen name={ROUTES.RemenberPassword} component={RemenberPassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_bottom' }} />
        <Stack.Screen name={ROUTES.ResetPassword} component={ResetPassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name={ROUTES.SelectLevelPerson} component={SelectLevelPerson} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
        <Stack.Screen name={ROUTES.ProfileHome} component={ProfileHome} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name={ROUTES.ProfileAccount} component={ProfileAccount} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name={ROUTES.ModuleCategory} component={ModuleCategory} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.Quiz} component={Quiz} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.QuizResults} component={QuizResults} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.ContentListCategory} component={ContentListCategory} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.QuizIntroScreen} component={QuizIntroScreen} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.ChangePassword} component={ChangePassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name={ROUTES.LevelStats} component={LevelStats} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.AccountDeletion} component={AccountDeletion} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name={ROUTES.DeactivatedAccount} component={DeactivatedAccount} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
