import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ label = "<" }) => {
  const navigation = useNavigation();
  const back = require('../assets/icon/back.png');

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Image source={back}/>
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
});

export default BackButton;