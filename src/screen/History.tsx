// History.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryParams {
  resultName?: string;
  questionCount?: number;
  tagScores?: { label: string; value: number }[];
  scoreMax?: number;
  testId?: string;
}

interface SavedResult {
  resultName: string;
  testId: string;
  questionCount: number;
  tagScores: { label: string; value: number }[];
  scoreMax: number;
  savedAt: string;
}

type HistoryRouteProp = RouteProp<{ History: HistoryParams }, 'History'>;

const History = () => {
  const route = useRoute<HistoryRouteProp>();
  const navigation = useNavigation<any>();
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedResults();
  }, []);

  const loadSavedResults = async () => {
    try {
      const existing = await AsyncStorage.getItem('savedResults');
      const list: SavedResult[] = existing ? JSON.parse(existing) : [];
      setSavedResults(list);
    } catch (err) {
      console.error('Load history error', err);
      setSavedResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGotoTheme = () => {
    navigation.navigate('ThemeSelection');
  };

  const handleDeleteResult = async (index: number) => {
    try {
      const updated = savedResults.filter((_, i) => i !== index);
      setSavedResults(updated);
      await AsyncStorage.setItem('savedResults', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete history error', err);
    }
  };

  const renderResultItem = ({ item, index }: { item: SavedResult; index: number }) => {
    const totalScore = item.tagScores.reduce((sum, s) => sum + s.value, 0);
    return (
      <View style={styles.card}>
        {/* Header: label + badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Tên</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {totalScore}/{item.scoreMax}
            </Text>
          </View>
        </View>
        {/* Value */}
        <Text style={styles.cardValue}>{item.resultName}</Text>
        <View style={styles.divider} />
        {/* Info row */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số lượng câu hỏi</Text>
          <Text style={styles.infoValue}>{item.questionCount}</Text>
        </View>
        {/* Delete button */}
        <TouchableOpacity
          onPress={() => handleDeleteResult(index)}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>Xóa để test chức năng</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#E0D7FE', '#FFFFFF']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <BackButton />
            <View style={styles.center}>
              <Text style={styles.header}>Lịch sử</Text>
            </View>
            <View style={styles.side} />
          </View>
          <View style={styles.content}>
            <Text>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0D7FE', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton />
          <View style={styles.center}>
            <Text style={styles.header}>Lịch sử</Text>
          </View>
          <View style={styles.side} />
        </View>

        {savedResults.length === 0 ? (
          // Empty state - tách content và button
          <>
            <View style={styles.emptyContainer}>
              <Image
                source={require('../assets/icon/history.png')}
                style={styles.image}
              />
              <View style={styles.textWrapper}>
                <Text style={styles.title}>Dữ liệu trống!</Text>
                <Text style={styles.textContent}>
                  Bạn chưa có lịch sử thực hiện, hãy bắt đầu một bài khảo sát.
                </Text>
              </View>
            </View>
            {/* Button ở ngoài để luôn ở dưới cùng */}
            <TouchableOpacity onPress={handleGotoTheme} style={styles.buttonWrapper}>
              <View style={styles.startButton}>
                <Text style={styles.startText}>Bắt đầu</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          // Results list state
          <>
            <FlatList
              data={savedResults}
              renderItem={renderResultItem}
              keyExtractor={(_, i) => `res-${i}`}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsListContent}
            />
            <TouchableOpacity onPress={handleGotoTheme} style={styles.buttonWrapper}>
              <View style={styles.startButton}>
                <Text style={styles.startText}>Bắt đầu</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  side: {
    width: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  // Empty state - chỉ chứa content, không chứa button
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 175,
    height: 150,
    resizeMode: 'contain',
  },
  textWrapper: {
    width: '70%',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  textContent: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  // Results list
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsListContent: {
    paddingBottom: 20,
  },
  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#EAF0FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0080FF',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Bottom button - giống nhau cho cả 2 trường hợp
  buttonWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
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