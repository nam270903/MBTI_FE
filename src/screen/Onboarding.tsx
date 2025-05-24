import * as React from 'react';
import { StyleSheet, Image, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

type RootStackParamList = {
  Onboarding: { isFirstLaunch: boolean };
  FirstHomeScreen: undefined;
  MainHomeScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
interface OnboardingProps {
  route: {
    params: {
      isFirstLaunch: boolean;
    };
  };
}

const Onboarding: React.FC<OnboardingProps> = ({ route }) => {
  const navigation = useNavigation<NavigationProp>();
  const { isFirstLaunch } = route.params;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(async () => {
      await AsyncStorage.setItem('hasLaunched', 'true');
      if (isFirstLaunch) {
        navigation.replace('FirstHomeScreen');
      } else {
        navigation.replace('MainHomeScreen');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isFirstLaunch, navigation, rotateAnimation]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Image source={require('../assets/icon/07.png')} style={styles.icon} />
      </Animated.View>
    </LinearGradient>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});
