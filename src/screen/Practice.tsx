import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../components/BackButton';

const Practice = () => {
  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.side}><BackButton /></View>
        <View style={styles.center}><Text style={styles.header}>Bài luyện tập</Text></View>
        <View style={styles.side} />
      </View>

    </LinearGradient>
  );
};

export default Practice;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
});
