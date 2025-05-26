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
const KEY_DEVICE = 'deviceId';
const KEY_USER   = 'userId';

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

const getOrCreateUser = async (): Promise<number> => {
  // 1. fetch / create deviceId
  let deviceId = await AsyncStorage.getItem(KEY_DEVICE);
  if (!deviceId) {
    deviceId = `device-${Date.now()}`;
    await AsyncStorage.setItem(KEY_DEVICE, deviceId);
  }

  // 2. try GET user by deviceId
  try {
    const resp = await axios.get<{
      code: string;
      message: string;
      data: { id: number }[];
    }>(`${API_BASE}/user?device_id=${encodeURIComponent(deviceId)}`, {
      headers: { Accept: 'application/json' },
    });

    const users = resp.data.data;
    if (users.length > 0) {
      const uid = users[0].id;
      await AsyncStorage.setItem(KEY_USER, uid.toString());
      return uid;
    }
  } catch {
    // GET 404/ gen bug -> create new user
  }

  // 3. POST new email randomly 
  const payload = {
    full_name:      'guest',
    email:          `${deviceId}-${Math.floor(Math.random() * 1e6)}@guest.test`,
    password:       'random_password',
    is_active:      true,
    role:           'guest',
    device_id:      deviceId,
    firebase_token: '',
  };
  const create = await axios.post<{
    code: string;
    message: string;
    data: { id: number };
  }>(`${API_BASE}/user`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const newId = create.data.data.id;
  await AsyncStorage.setItem(KEY_USER, newId.toString());
  return newId;
};

// --- COMPONENT ---
const StartTestScreen = () => {
  const navigation = useNavigation<any>();
  const { testId } = useRoute<any>().params;

  const [userId, setUserId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Check user/ create new user
  useEffect(() => {
    (async () => {
      try {
        const uid = await getOrCreateUser();
        setUserId(uid);
      } catch (e) {
        console.error('User init error', e);
        setError('Không thể xác thực người dùng.');
        setLoading(false);
      }
    })();
  }, []);

  // 2) Load test questions and answers for checked user 
  const loadTest = useCallback(async () => {
    if (userId === null) return;
    setLoading(true);
    setError(null);

    try {
      // fetch questions
      const qRes = await axios.get<{ data: Question[] }>(
        `${API_BASE}/psychology/test/${testId}/questions`
      );
      const qs = qRes.data.data;
      if (qs.length === 0) throw new Error('Không có câu hỏi.');

      setQuestions(qs);

      // fetch answers map
      const amap: Record<number, Answer[]> = {};
      await Promise.all(
        qs.map(async (q) => {
          try {
            const aRes = await axios.get<{ data: Answer[] }>(
              `${API_BASE}/psychology/test/${q.id}/answer`
            );
            amap[q.id] = aRes.data.data;
          } catch {
            amap[q.id] = [];
          }
        })
      );
      setAnswersMap(amap);
    } catch (e: any) {
      console.error('Load test error', e);
      setError(e.message || 'Không thể tải câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, [testId, userId]);

  useEffect(() => {
    if (userId !== null) loadTest();
  }, [userId, loadTest]);

  // On answer selection
  const selectAnswer = (ansId: number) => {
    setSelectedId(ansId);
    const qid = questions[currentIndex].id;
    setUserAnswers((prev) => [
      ...prev.filter((u) => u.question_id !== qid),
      { question_id: qid, answer_id: ansId },
    ]);
  };

  // Next / Submit
  const onNext = async () => {
    if (currentIndex < questions.length - 1) {
      setSelectedId(null);
      setCurrentIndex((i) => i + 1);
    } else {
      // submit
      setLoading(true);
      try {
        await axios.post(`${API_BASE}/psychology/test/submit`, {
          user_id:  userId,
          test_id:  testId,
          answers:  userAnswers,
        });
        navigation.replace('ResultScreen', { testId });
      } catch (e: any) {
        console.error('Submit error', e.response?.data || e.message);
        setError('Gửi kết quả thất bại.');
      } finally {
        setLoading(false);
      }
    }
  };

  // UI
  const currQ  = questions[currentIndex];
  const currA  = currQ ? answersMap[currQ.id] || [] : [];
  const prog   = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
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
          <View style={[styles.barFill, { width: `${prog}%` }]} />
        </View>
        <Text style={styles.counter}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>{currQ?.name}</Text>
        {currA.map((a) => (
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
  background:     { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16, marginBottom: 12 },
  barBg:          { flex:1, height:6, backgroundColor:'#D0D0D0', borderRadius:3, marginHorizontal:12 },
  barFill:        { height:6, backgroundColor:'#0080FF', borderRadius:3 },
  counter:        { width:48, textAlign:'right', fontWeight:'600' },
  content:        { flex:1, paddingHorizontal:20 },
  question:       { fontSize:20, fontWeight:'600', marginBottom:16, color:'#181D22' },
  answer:         { backgroundColor:'#FFF', padding:15, borderRadius:16, borderWidth:1, borderColor:'#EEE', marginBottom:12 },
  answerSel:      { backgroundColor:'#0080FF', borderColor:'#0080FF' },
  answerText:     { fontSize:16, color:'#333' },
  answerTextSel:  { color:'#FFF', fontWeight:'600' },
  next:           { height:52, borderRadius:99, justifyContent:'center', alignItems:'center', margin:20 },
  nextText:       { fontSize:16, fontWeight:'600', color:'#FFF' },
  loadingContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  errorContainer: { flex:1, justifyContent:'center', alignItems:'center', paddingHorizontal:20 },
  errorText:      { textAlign:'center', fontSize:16, color:'red', marginBottom:20 },
  retryBtn:       { backgroundColor:'#6200EE', padding:12, borderRadius:8 },
  retryText:      { color:'#FFF', fontWeight:'600' },
});
