import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import axios from 'axios';

type Category = {
  id: number;
  name: string;
  image: string | null;
  description: string;
};

const screenWidth = Dimensions.get('window').width;
const CARD_SIZE = (screenWidth - 48) / 2;

const ThemeSelection = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('https://psychologytestbe-production.up.railway.app/api/v1/psychology/categories', {
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      setCategories(response.data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to fetch categories:', error);
      setLoading(false);
    });
  }, []);

  const handleTestSelection = (categoryId: number) => {
    navigation.navigate('TestSelectionScreen', { categoryId });
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleTestSelection(item.id)}>
      <Image
        source={item.image ? { uri: item.image } : require('../assets/icon/theme.png')}
        style={styles.image}
        resizeMode="contain"/>
      <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderListEmptyComponent = () => (
    <View style={styles.loaderContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <Text style={styles.emptyText}>Không có danh mục nào</Text>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.side}><BackButton /></View>
        <View style={styles.center}><Text style={styles.header}>Lựa chọn của bạn</Text></View>
        <View style={styles.side} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmptyComponent}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
};

export default ThemeSelection;

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
    color: '#181D22',
    lineHeight: 32,
    fontFamily: 'Be Vietnam Pro',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#181D22',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    minHeight: 192,
    width: CARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,

  },
  image: {
    width: 88,
    height: 88,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    color: '#181D22',
    fontFamily: 'Be Vietnam Pro',
  },
});