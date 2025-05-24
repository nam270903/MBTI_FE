import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView,TouchableOpacity, StatusBar, Platform} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../components/BackButton';
import axios from 'axios';

const TestDetailsScreen = () => {
  const route = useRoute<any>();
  const { testId } = route.params;
  const [testDetails, setTestDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const navigation = useNavigation<any>();

  const handleStartTest = (testId: number) => {
    navigation.navigate('StartTestScreen', { testId });
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(
          `https://psychologytestbe-production.up.railway.app/api/v1/psychology/test/${testId}`,
          { headers: { Accept: 'application/json' } }
        );
        if (response.data?.data) {
          setTestDetails(response.data.data);
        } else {
          setError(response.data.message || 'Không thể tải chi tiết.');
        }
      } catch (error) {
        setError('Không thể tải chi tiết bài test. Vui lòng thử lại sau.');
      }
    };
    fetchTestDetails();
  }, [testId]);

  return (
    <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={styles.background}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.container}>
        <View style={styles.statusBarSpace} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.side}><BackButton /></View>
            <View style={styles.center}><Text style={styles.header}>MBTI</Text></View>
            <View style={styles.side} />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : testDetails ? (
            <View style={styles.card}>
              <View style={styles.row}><Text style={styles.label}>Chủ đề</Text><Text>{testDetails.test_name}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Nội dung</Text><Text>Bài kiểm tra thực hiện đo lường trạng thái tâm lí. Kiểm tra xem tình trạng hiện tại có gặp vấn đề về cảm xúc hay không</Text></View>
              <View style={styles.row}><Text style={styles.label}>Đã kiểm tra</Text><Text>158   4.8 ⭐</Text></View>
              <View style={styles.row}><Text style={styles.label}>Số lượng câu hỏi</Text><Text style={styles.badgeBlue}>📘 {testDetails.question_count} câu hỏi</Text></View>
              <View style={styles.row}><Text style={styles.label}>Thời gian ước lượng</Text><Text style={styles.badgeGreen}>⏱ 15 phút</Text></View>
            </View>
          ) : null}

          <View style={styles.instructionCard}>
            <Text style={styles.label}>Hướng dẫn</Text>
            <Text>Nhấn nút bắt đầu và lựa chọn câu trả lời đúng nhất với bạn!</Text>
          </View>

          <View style={styles.confirmationContainer}>
            <TouchableOpacity
              style={isChecked ? styles.checkedBox : styles.uncheckedBox}
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && <Text style={{ color: '#FFFFFF' }}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.confirmationText}>Xác nhận</Text>
          </View>

        </ScrollView>

        <TouchableOpacity
          disabled={!isChecked}
          style={[
            styles.startButtonWrapper,
            { backgroundColor: isChecked ? '#0080FF' : '#B5D7F9' }
          ]}
          onPress={() => handleStartTest(testId)}
        >
          <Text style={styles.startText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  statusBarSpace: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  badgeBlue: {
    backgroundColor: '#E0F0FF',
    color: '#007AFF',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  badgeGreen: {
    backgroundColor: '#D0F5E3',
    color: '#0A8F52',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#0080FF',
    borderRadius: 4,
  },
  checkedBox: {
    width: 20,
    height: 20,
    backgroundColor: '#0080FF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: '#131414',
    fontWeight: '600',
  },
  startButtonWrapper: {
    height: 52,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    width: '90%', 
  },
  startText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default TestDetailsScreen;