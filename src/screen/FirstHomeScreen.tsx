import * as React from 'react';
import { Text, StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const FirstHomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleGotoTheme = () => {
    navigation.navigate('ThemeSelection');
  };

  return (
    <LinearGradient colors={['#E0D7FE', '#FFFFFF']} style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../assets/icon/08.png')} style={styles.image} />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Hành Trình Hạnh Phúc</Text>
          <Text style={styles.textContent}>Hạnh phúc không phải là một điểm đến, mà là một hành trình mà bạn khám phá cho chính mình.</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleGotoTheme} style={styles.buttonWrapper}>
        <View style={styles.startButton}>
          <Text style={styles.startText}>Bắt đầu </Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default FirstHomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    image: {
      width: 288,
      height: 288,
      resizeMode: 'contain',
    },

    textWrapper: {
        width: '70%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    title:{
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 10,
        color: '#000000',
        fontFamily: 'Be Vietnam Pro',
    },

    textContent:{
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: 10,
        color: '#000000',
        fontFamily: 'Be Vietnam Pro',
    },
  
    buttonWrapper: {
      alignItems: 'center',
      paddingBottom: 40,
    },
  
    startButton: {
      width: 335,
      height: 52,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 24,
      paddingRight: 16,
      backgroundColor: '#0080FF',
      borderRadius: 99,
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    startText: {
      color: '#ffffff',
      fontSize: 17,
      fontWeight: 'bold',
      fontFamily: 'Be Vietnam Pro',
    },
  });
