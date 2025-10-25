import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { AuthProvider } from './contexts/AuthContext';
import SelectionScreen from './(tabs)/SelectionScreen/SelectionScreen';
import LoginScreen from './(tabs)/LoginScreen/index';
import RegisterUser from './(tabs)/RegisterUser/RegisterUser';
import RemenberPassword from './(tabs)/RemenberPassword/index';
import SelectLevelPerson from './(tabs)/SelectLevelPerson/SelectLevelPerson';
import ProfileHome from './(tabs)/ProfileHome/profileHome';
import ProfileAccount from './(tabs)/ProfileAccount/ProfileAccount';
import ModuleCategory from './(tabs)/ModuleCategory/ModuleCategory';
import Quiz from './(tabs)/Quiz/Quiz';
import QuizResults from './(tabs)/Quiz/QuizResults';
import ContentListCategory from './(tabs)/ModuleCategory/ContentListCategory/ContentListCategory';
import QuizIntroScreen from './(tabs)/Quiz/QuizIntroScreen/QuizIntroScreen';
import ChangePassword from './(tabs)/ChangePassword/ChangePassword';
import LevelStats from './(tabs)/LevelStats/LevelStats';
import AccountDeletion from './(tabs)/AccountDeletion';
import DeactivatedAccount from './(tabs)/DeactivatedAccount';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
const Stack = createNativeStackNavigator();

const fetchFonts = () => {
  return Font.loadAsync({
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });
};

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await fetchFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
        // Mesmo com erro nas fontes, continuar o app
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  // Exibir um carregador enquanto as fontes estão sendo carregadas
  if (!fontsLoaded) {
    return null; // Ou você pode retornar um ActivityIndicator aqui
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer >
         
            <Stack.Navigator  
            screenOptions={{
            animation: 'slide_from_right', // Mude a animação conforme desejado
          
          }}>
              <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false }} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
              <Stack.Screen name="RegisterUser" component={RegisterUser} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
              <Stack.Screen name="RemenberPassword" component={RemenberPassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_bottom'  }} />
              <Stack.Screen name="SelectLevelPerson" component={SelectLevelPerson} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
              
              <Stack.Screen name="ProfileHome" component={ProfileHome} options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="ProfileAccount" component={ProfileAccount} options={{ headerShown: false , animation: 'fade'}} />
              <Stack.Screen name="ModuleCategory" component={ModuleCategory} options={{ headerShown: false }} />
              <Stack.Screen name="Quiz" component={Quiz} options={{ headerShown: false }} />
              <Stack.Screen name="QuizResults" component={QuizResults} options={{ headerShown: false }} />
              <Stack.Screen name="ContentListCategory" component={ContentListCategory} options={{ headerShown: false }} />
              <Stack.Screen name="QuizIntroScreen" component={QuizIntroScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
              <Stack.Screen name="LevelStats" component={LevelStats} options={{ headerShown: false }} />

            </Stack.Navigator>
         
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default App;
