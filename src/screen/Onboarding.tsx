import * as React from 'react';
import { StyleSheet, Image, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';

type RootStackParamList = {
  Onboarding: { isFirstLaunch?: boolean; onComplete?: () => Promise<void> };
  FirstHomeScreen: undefined;
  MainHomeScreen: undefined;
};

type OnboardingProps = {
  route: {
    params?: {
      isFirstLaunch?: boolean;
      onComplete?: () => Promise<void>;
    };
  };
};

const Onboarding = ({ route }: OnboardingProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFirstLaunch = route?.params?.isFirstLaunch;
  const onComplete = route?.params?.onComplete;
  
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
    
    const timer = setTimeout(() => {
      if (isFirstLaunch) {
        if (onComplete) {
          onComplete();
        }
        navigation.navigate('FirstHomeScreen');
      } else {
        navigation.navigate('MainHomeScreen');
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [isFirstLaunch, onComplete, navigation, rotateAnimation]);
  
  // Create the rotation interpolation
  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={styles.container}>
      <Animated.View style={{transform: [{ rotate: spin }]}}>
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
  }
});