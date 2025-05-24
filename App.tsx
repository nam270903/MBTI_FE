import React, { useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

export type RootStackParamList = {
  Onboarding: { isFirstLaunch: boolean };
  FirstHomeScreen: undefined;
  MainHomeScreen: undefined;
  ThemeSelection: undefined;
  TestSelectionScreen: undefined;
  Practice: undefined;
  History: undefined;
  TestDetailsScreen: undefined;
  StartTestScreen: { deviceId: string };
  ResultScreen: { deviceId: string };
};

// Screens
import Onboarding from './src/screen/Onboarding';
import FirstHomeScreen from './src/screen/FirstHomeScreen';
import MainHomeScreen from './src/screen/MainHomeScreen';
import ThemeSelection from './src/screen/ThemeSelection';
import TestSelectionScreen from './src/screen/TestSelectionScreen';
import History from './src/screen/History';
import Practice from './src/screen/Practice';
import TestDetailsScreen from './src/screen/TestDetailsScreen';
import StartTestScreen from './src/screen/StartTestScreen';
import ResultScreen from './src/screen/ResultScreen';

export const DeviceContext = React.createContext<string>('');

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
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
      setDeviceId(id);
    })();
  }, []);

  if (isFirstLaunch === null) {
    return null; 
  }

  return (
    <DeviceContext.Provider value={deviceId}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            initialParams={{ isFirstLaunch }}
          />
          <Stack.Screen name="FirstHomeScreen" component={FirstHomeScreen} />
          <Stack.Screen name="MainHomeScreen" component={MainHomeScreen} />
          <Stack.Screen name="ThemeSelection" component={ThemeSelection} />
          <Stack.Screen name="TestSelectionScreen" component={TestSelectionScreen} />
          <Stack.Screen name="Practice" component={Practice} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="TestDetailsScreen" component={TestDetailsScreen} />
          <Stack.Screen name="StartTestScreen" component={StartTestScreen} initialParams={{ deviceId }} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} initialParams={{ deviceId }} />
        </Stack.Navigator>
      </NavigationContainer>
    </DeviceContext.Provider>
  );
};

export default App;