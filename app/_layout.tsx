import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import SelectionScreen from './(tabs)/SelectionScreen/SelectionScreen';
import LoginScreen from './(tabs)/LoginScreen/index';
import RegisterUser from './(tabs)/RegisterUser/RegisterUser';
import RemenberPassword from './(tabs)/RemenberPassword/index';
import SelectLevelPerson from './(tabs)/SelectLevelPerson/SelectLevelPerson';
import ProfileHome from './(tabs)/ProfileHome/profileHome';
import ProfileAccount from './(tabs)/ProfileAccount/ProfileAccount';
import ModuleCategory from './(tabs)/ModuleCategory/ModuleCategory';
import Quiz from './(tabs)/Quiz/Quiz';
import ContentListCategory from './(tabs)/ModuleCategory/ContentListCategory/ContentListCategory';
import QuizIntroScreen from './(tabs)/Quiz/QuizIntroScreen/QuizIntroScreen';
const Stack = createNativeStackNavigator();

const fetchFonts = () => {
  return Font.loadAsync({
  // Fonts Roboto
  'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
  'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
  'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  // Fonts Poppins
  'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });
};

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await fetchFonts();
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // Exibir um carregador enquanto as fontes estão sendo carregadas
  if (!fontsLoaded) {
    return null; // Ou você pode retornar um ActivityIndicator aqui
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer independent={true}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}> 
          <Stack.Navigator  
          screenOptions={{
          animation: 'slide_from_right', // Mude a animação conforme desejado
        
        }}>
            <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar' }} />
            <Stack.Screen name="RegisterUser" component={RegisterUser} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
            <Stack.Screen name="RemenberPassword" component={RemenberPassword} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="SelectLevelPerson" component={SelectLevelPerson} options={{ title: '', headerTransparent: true, headerTintColor: 'black', headerBackTitle: 'Voltar', animation: 'slide_from_left' }} />
            <Stack.Screen name="ProfileHome" component={ProfileHome} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="ProfileAccount" component={ProfileAccount} options={{ headerShown: false , animation: 'fade'}} />
            <Stack.Screen name="ModuleCategory" component={ModuleCategory} options={{ headerShown: false }} />
            <Stack.Screen name="Quiz" component={Quiz} options={{ headerShown: false }} />
            <Stack.Screen name="ContentListCategory" component={ContentListCategory} options={{ headerShown: false }} />
            <Stack.Screen name="QuizIntroScreen" component={QuizIntroScreen} options={{ headerShown: false }} />

          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
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
