import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  TextInput, 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadarChart } from '@salmonco/react-native-radar-chart';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const RADAR_CONTAINER_HEIGHT = 282;
const RADAR_CHART_SIZE = RADAR_CONTAINER_HEIGHT - CARD_PADDING * 2;
const API_BASE = 'https://psychologytestbe-production.up.railway.app/api/v1';

const ResultScreen: React.FC = () => {
  const { testId } = useRoute<any>().params;
  const [testDetails, setTestDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [resultName, setResultName] = useState<string>('');
  const navigation = useNavigation<any>();

  // fetch data
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const deviceId = await AsyncStorage.getItem('deviceId');
        const url = `${API_BASE}/psychology/test/history/${deviceId}/${testId}`;
        const { data } = await axios.get<{ data: any }>(url, {
          headers: { Accept: 'application/json' },
        });
        setTestDetails(data.data);
      } catch {
        setError('Không thể tải kết quả. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  // prepare radar data
  const advice = testDetails?.advice;
  const tagScores = useMemo((): { label: string; value: number }[] => {
    if (Array.isArray(testDetails?.tag_scores)) {
      return testDetails.tag_scores.map((t: any) => ({
        label: String(t.tag_name),
        value: Number(t.score),
      }));
    }
    return [];
  }, [testDetails]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="small" color="#6200EE" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  const handleTakeAnotherTest = () => {
    navigation.navigate('ThemeSelection');
  };

  const handleSaveResult = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    try {
      const questionCount = testDetails?.num_questions ?? 0;

      // Save the result to AsyncStorage or your preferred storage method
      const savedResult = {
        resultName: resultName || `Test ${testId}`,
        testId,
        questionCount: questionCount,
        tagScores: tagScores,
        scoreMax: advice?.score_max || 0,
        savedAt: new Date().toISOString(),
      };

      // Get existing saved results
      const existingResults = await AsyncStorage.getItem('savedResults');
      const savedResults = existingResults ? JSON.parse(existingResults) : [];
      
      // Add new result
      savedResults.push(savedResult);
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('savedResults', JSON.stringify(savedResults));

      setShowSaveModal(false);
      
      // Navigate to History with the saved result data
      navigation.navigate('History', {
        resultName: resultName || `Test ${testId}`,
        testId,
        questionCount: questionCount,
        tagScores: tagScores,
        scoreMax: advice?.score_max || 0,
      });
      
      setResultName('');
    } catch (error) {
      console.error('Error saving result:', error);
      // You might want to show an error message to the user
      setShowSaveModal(false);
    }
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
    setResultName('');
  };
    

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titleBig}>Tư vấn</Text>
        <Text style={styles.titleSmall}>Kết quả đánh giá của bạn!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Result */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
          <Text style={styles.label}>🤨   Điểm của bạn</Text>
          {tagScores.length ? (
            tagScores.map(({ label, value }: { label: string; value: number }) => (
              <View style={styles.row} key={label}>
                <Text style={styles.yourScore}>{value}</Text>
                <Text style={styles.totalScore}> / {advice?.score_max || 0}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>Không có điểm chủ đề.</Text>
          )}
          </View>
        </View>

        {/* Radar chart */}
        {tagScores.length > 0 && advice?.score_max && (
          <View style={styles.radarCard}>
            <RadarChart
              data={tagScores}
              maxValue={advice.score_max}
              size={RADAR_CHART_SIZE}
              divisionStroke="#E6E6E6"
              divisionStrokeWidth={1}
              divisionStrokeOpacity={0.5}
              gradientColor={{ startColor: 'rgba(135,93,241,0.1)', endColor: 'rgba(135,93,241,0.1)', count: 5 }}
              stroke={['#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6', '#8C6DD0']}
              strokeWidth={[1, 1, 1, 1, 1, 2]}
              strokeOpacity={[1, 1, 1, 1, 1, 1]}
              dataFillColor="#8C6DD0"
              dataFillOpacity={0.3}
              dataStroke="#8C6DD0"
              dataStrokeWidth={2}
              labelColor="#181D22"
              labelSize={14}
              labelDistance={1.15}
              isCircle={false}/>
          </View>
        )}

        {/* Advice box */}
        {advice && (
          <View style={styles.adviceBox}>
            <View style={{flexDirection:'row', gap: 8,}}>
              <Text style={{fontSize:24, color:'#0080FF', }}>✻</Text>
              <Text style={styles.cardTitle}> {advice.title}</Text>
            </View>
            <Text style={styles.cardContent}>{advice.content}</Text>
          </View>
        )}

      </ScrollView>

        <View style={styles.footer}>
          {/* Save result */}
          <TouchableOpacity style={styles.btnOutline} onPress={handleSaveResult}>
            <Text style={styles.btnOutlineText}>Lưu kết quả</Text>
          </TouchableOpacity>

          {/* Take another test */}
          <TouchableOpacity style={styles.btnFill} onPress={handleTakeAnotherTest}>
            <Text style={styles.btnFillText}>Thử bài khác</Text>
          </TouchableOpacity>
        </View>

        {/* Save Result Modal */}
        <Modal
          visible={showSaveModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleSaveCancel}
        >
          <TouchableWithoutFeedback onPress={handleSaveCancel}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalIcon}>✻</Text>
                    <Text style={styles.modalTitle}>Tên kết quả</Text>
                  </View>
                  
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Tên bạn muốn đặt cho kết quả này"
                    value={resultName}
                    onChangeText={setResultName}
                    placeholderTextColor="#999"/>
                  
                  <Text style={styles.modalDescription}>
                    Bạn có thể nhập bất kỳ nội dung mà bạn muốn với mục đích ghi nhớ!
                  </Text>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalBtnCancel} onPress={handleSaveCancel}>
                      <Text style={styles.modalBtnCancelText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveConfirm}>
                      <Text style={styles.modalBtnSaveText}>Lưu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

    </SafeAreaView>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3D9',
    paddingTop: 20,
    gap: 16
  },
  header: {
    paddingHorizontal: CARD_PADDING,
    marginBottom: 8
  },
  titleBig: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFC441',
    fontFamily: 'Be Vietnam Pro'
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010101',
    fontFamily: 'Be Vietnam Pro'
  },
  scroll: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 20
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  radarCard:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131313',
    fontFamily: 'Be Vietnam Pro'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yourScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0080FF',
    fontFamily: 'Be Vietnam Pro'
  },
  totalScore: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ABABAB',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 26,
  },
  text: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
    fontFamily: 'Be Vietnam Pro'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
    fontFamily: 'Be Vietnam Pro'
  },
  cardContent: {
    fontSize: 15,
    color: '#181D22',
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: 'Be Vietnam Pro'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PADDING,
    marginBottom: 20
  },
  adviceBox: {
    padding: 16,
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FFF',
    borderRadius: 99,
    paddingVertical: 14,
    alignItems: 'center'
  },
  btnOutlineText: {
    color: '#0080FF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro'
  },
  btnFill: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#0080FF',
    borderRadius: 99,
    paddingVertical: 14,
    alignItems: 'center'
  },
  btnFillText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8
  },
  modalIcon: {
    fontSize: 20,
    color: '#0080FF'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
    fontFamily: 'Be Vietnam Pro'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 12
  },
  modalDescription: {
    fontSize: 14,
    color: '#0080FF',
    fontFamily: 'Be Vietnam Pro',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalBtnCancelText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro'
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: '#0080FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalBtnSaveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro'
  },
});