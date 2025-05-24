import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import axios from 'axios';

type Test = {
  id: number;
  test_name: string;
  image: string | null;
  category_id: number;
};

const TestSelection = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId } = route.params;
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`https://psychologytestbe-production.up.railway.app/api/v1/psychology/categories/${categoryId}/tests`, {
      headers: { Accept: 'application/json' }
    })
    .then(response => {
      setTests(response.data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Lỗi khi gọi API test list:', error);
      setLoading(false);
    });
  }, [categoryId]);

  const handleTestPress = (testId: number) => {
    navigation.navigate('TestDetailsScreen', { testId });
  };

  const renderItem = ({ item }: { item: Test }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleTestPress(item.id)}
      activeOpacity={0.8}>

      <Image
        source={item.image ? { uri: item.image } : require('../assets/icon/test.jpg')}
        style={styles.image}/>

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.test_name}</Text>
        <Text numberOfLines={2} style={styles.description}>Khám phá bản thân, hiểu rõ cảm xúc và tâm lý của bạn. </Text>
      </View>

    </TouchableOpacity>
  );

  const renderListEmptyComponent = () => (
    <View style={styles.loaderContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <Text style={styles.emptyText}>Không có bài test nào</Text>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.side}><BackButton /></View>
        <View style={styles.center}><Text style={styles.header}>Trí tuệ cảm xúc</Text></View>
        <View style={styles.side} />
      </View>

      <FlatList
        data={loading ? [] : tests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmptyComponent}
        contentContainerStyle={loading ? { flex: 1, justifyContent: 'center' } : {}}
      />
    </LinearGradient>
  );
};

export default TestSelection;

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
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    fontFamily: 'Be Vietnam Pro',
    color: '#181D22',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#5C656F',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    alignItems: 'flex-start',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#181D22',
    lineHeight: 24,
    fontFamily: 'Be Vietnam Pro',
  },
  description: {
    fontSize: 12,
    color: '#5C656F',
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
});
