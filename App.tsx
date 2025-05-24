import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

// Screens
import Onboarding from './src/screen/Onboarding';
import FirstHomeScreen from './src/screen/FirstHomeScreen';
import MainHomeScreen from './src/screen/MainHomeScreen';
import ThemeSelection from './src/screen/ThemeSelection';
import TestSelection from './src/screen/TestSelectionScreen';
import History from "./src/screen/History";
import Practice from "./src/screen/Practice";
import TestDetailsScreen from "./src/screen/TestDetailsScreen";
import StartTestScreen from "./src/screen/StartTestScreen";
import ResultScreen from "./src/screen/ResultScreen";

const Stack = createNativeStackNavigator();

export const DeviceContext = React.createContext<string>('');

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);

      const storedId = await AsyncStorage.getItem('deviceId');
      let id: string;
      if (storedId) {
        id = storedId;
      } else {
        id = await DeviceInfo.getUniqueId();
        await AsyncStorage.setItem('deviceId', id);
      }
      console.log('Device ID:', id);
      setDeviceId(id);
    })();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setIsFirstLaunch(false);
  };

  return (
    <DeviceContext.Provider value={deviceId}>
      <NavigationContainer>    
        <Stack.Navigator>
          <Stack.Screen name="Onboarding"component={Onboarding} options={{ headerShown: false }} initialParams={{ isFirstLaunch, onComplete: handleOnboardingComplete }}/>
          <Stack.Screen name="FirstHomeScreen" component={FirstHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainHomeScreen" component={MainHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ThemeSelection" component={ThemeSelection} options={{ headerShown: false }} />
          <Stack.Screen name="TestSelectionScreen" component={TestSelection} options={{ headerShown: false }} />
          <Stack.Screen name="Practice" component={Practice} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={History} options={{ headerShown: false }} />
          <Stack.Screen name="TestDetailsScreen" component={TestDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StartTestScreen" component={StartTestScreen} initialParams={{ deviceId }} options={{ headerShown: false }}/>
          <Stack.Screen name="ResultScreen" component={ResultScreen} initialParams={{ deviceId }} options={{ headerShown: false }} />
        </Stack.Navigator>
        </NavigationContainer>
      </DeviceContext.Provider>
  );
};

export default App;
