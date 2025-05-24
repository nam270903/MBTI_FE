import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ label = "<" }) => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#404040',
  },
});

export default BackButton;