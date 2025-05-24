import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

// --- CONFIG ---
const API_BASE = 'https://psychologytestbe-production.up.railway.app/api/v1';
const STORAGE_USER_ID = 'userId';

// --- TYPES ---
interface Question {
  id: number;
  name: string;
}
interface Answer {
  id: number;
  question_id: number;
  answer: string;
  score: number;
}
type UserAnswer = { question_id: number; answer_id: number };

// --- UTILS ---
const emojiForScore = (score: number) => {
  const map: Record<number, string> = {
    1: '😞',
    2: '👌',
    3: '😊',
    4: '😄',
    5: '🤩',
  };
  return map[score] || '❓';
};

// --- COMPONENT ---
const StartTestScreen = () => {
  const navigation = useNavigation<any>();
  const { testId } = useRoute<any>().params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // load or create userId
  useEffect(() => {
    (async () => {
      try {
        let deviceId = await AsyncStorage.getItem('deviceId');
        if (!deviceId) {
          deviceId = `android-${Date.now()}`;
          await AsyncStorage.setItem('deviceId', deviceId);
        }

        const stored = await AsyncStorage.getItem(STORAGE_USER_ID);
        if (stored) {
          setUserId(Number(stored));
          return;
        }

        const payload = {
          is_active: true,
          role: 'guest',
          device_id: deviceId,
          firebase_token: '',
          full_name:'guest',
          email:`guest_${deviceId}@app.test`,
          password:'random_password',
        };
        const res = await axios.post(`${API_BASE}/user`, payload);
        const newId = res.data.data.id;
        await AsyncStorage.setItem(STORAGE_USER_ID, newId.toString());
        setUserId(newId);
      } catch (error: any) {
        console.error('Create user error response:', error.response?.status, error.response?.data);
        setError('Không thể tạo người dùng.');
        setLoading(false);
      }
    })();
  }, []);

  // fetch questions + answers
  const loadTest = useCallback(async () => {
    if (userId === null) return;
    setLoading(true);
    setError(null);

    try {
      const { data: qData } = await axios.get<{ data: Question[] }>(
        `${API_BASE}/psychology/test/${testId}/questions`
      );
      const qs = qData.data;
      if (!qs.length) throw new Error('Không có câu hỏi.');

      setQuestions(qs);

      const map: Record<number, Answer[]> = {};
      await Promise.all(
        qs.map(async (q) => {
          try {
            const { data: aData } = await axios.get<{ data: Answer[] }>(
              `${API_BASE}/psychology/test/${q.id}/answer`
            );
            map[q.id] = aData.data;
          } catch {
            map[q.id] = [];
          }
        })
      );
      setAnswersMap(map);
    } catch (error: any) {
      console.error('Load test error:', error.message || error);
      setError(error.message || 'Không thể tải câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, [testId, userId]);

  useEffect(() => {
    if (userId !== null) {
      loadTest();
    }
  }, [userId, loadTest]);

  const selectAnswer = (ansId: number) => {
    setSelectedId(ansId);
    setUserAnswers((prev) => {
      const qid = questions[currentIndex].id;
      return [...prev.filter((u) => u.question_id !== qid), { question_id: qid, answer_id: ansId }];
    });
  };

  const submitAnswers = useCallback(async () => {
    if (userId === null) {
      setError('Chưa có user ID.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/psychology/test/submit`, {
        user_id: userId,
        test_id: testId,
        answers: userAnswers,
      });
      navigation.replace('ResultScreen', { testId });
    } catch (error: any) {
      console.error('Submit answers error:', error.response?.data || error.message);
      setError('Gửi kết quả thất bại.');
    } finally {
      setLoading(false);
    }
  }, [userId, testId, userAnswers, navigation]);

  const onNext = () => {
    if (currentIndex < questions.length - 1) {
      setSelectedId(null);
      setCurrentIndex((i) => i + 1);
    } else {
      submitAnswers();
    }
  };

  const currQ = questions[currentIndex];
  const currAs = currQ ? answersMap[currQ.id] || [] : [];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6200EE" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadTest} style={styles.retryBtn}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={styles.background}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>{currQ?.name}</Text>
        {currAs.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.answer, selectedId === a.id && styles.answerSel]}
            onPress={() => selectAnswer(a.id)}
          >
            <Text style={[styles.answerText, selectedId === a.id && styles.answerTextSel]}>
              {emojiForScore(a.score)} {a.answer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.next, { backgroundColor: selectedId ? '#0080FF' : '#B5D7F9' }]}
        onPress={onNext}
        disabled={!selectedId}
      >
        <Text style={styles.nextText}>
          {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default StartTestScreen;

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  barFill: {
    height: 6,
    backgroundColor: '#0080FF',
    borderRadius: 3,
  },
  counter: {
    width: 48,
    textAlign: 'right',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#181D22',
  },
  answer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 12,
  },
  answerSel: {
    backgroundColor: '#0080FF',
    borderColor: '#0080FF',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
  },
  answerTextSel: {
    color: '#FFF',
    fontWeight: '600',
  },
  next: {
    height: 52,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
