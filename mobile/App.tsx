import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Updates from 'expo-updates';
import { LoginScreen } from './src/screens/LoginScreen';
import JarvisScreen from './src/screens/JarvisScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) return; // No chequear en modo desarrollo
      
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('📦 Nueva actualización OTA disponible. Descargando...');
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log("❌ Error en actualización OTA:", e);
      }
    }

    checkForUpdates();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Jarvis" component={JarvisScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
