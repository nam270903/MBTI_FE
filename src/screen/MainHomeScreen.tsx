import * as React from 'react';
import { Text, StyleSheet, Image, TouchableOpacity, View, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const MainHomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleGotoTheme = () => {
    navigation.navigate('ThemeSelection');
  };

  const handleGotoHistory = () => {
    navigation.navigate('History');
  };

  const handleGotoPractice = () => {
    navigation.navigate('Practice');
  };

  return (
  <LinearGradient colors={['#E0D7FE', '#D6F9FE']} style={styles.container}>
    <View style={styles.contentWrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hành trình */}
        <View style={styles.journeyCard}>
          <Image source={require('../assets/icon/08.png')} style={styles.image} />
          <View style={styles.journeyTextWrapper}>
            <Text style={styles.title}>Hành Trình Hạnh Phúc</Text>
            <Text style={styles.textContent}>
              Hạnh phúc không phải là một điểm đến, mà là một hành trình mà bạn khám phá cho chính mình.
            </Text>
          </View>
        </View>

        {/* Lời tư vấn */}
        <View style={styles.adviceBox}>
          <Text style={styles.adviceTitle}> Lời tư vấn dành cho bạn</Text>
          <Text style={styles.adviceContent}>
            Bạn có xu hướng là người hướng nội, thích không gian yên tĩnh và những cuộc trò chuyện sâu sắc. Nếu bạn là người hướng ngoại, hãy giao tiếp nhiều hơn để mở rộng kết nối xã hội.
          </Text>
          <TouchableOpacity style={styles.dailyButton}>
            <Text style={styles.dailyButtonText}>Xem bài tập ngày hôm nay</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.tabButtons}>
          <TouchableOpacity style={styles.practiceBtn} onPress={handleGotoPractice}>
            <Text style={styles.practiceText}>Luyện tập</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyBtn} onPress={handleGotoHistory}>
            <Text style={styles.historyText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bắt đầu */}
      <TouchableOpacity onPress={handleGotoTheme} style={styles.startButtonWrapper}>
        <View style={styles.startButton}>
          <Text style={styles.startText}>Bắt đầu</Text>
        </View>
      </TouchableOpacity>
    </View>
  </LinearGradient>
  );
};

export default MainHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  scroll: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  journeyCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  journeyTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Be Vietnam Pro',
  },
  textContent: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '400',
    lineHeight: 20,

  },
  adviceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    gap: 24,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
    lineHeight: 24,
  },
  adviceContent: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    color: '#444444',
  },
  dailyButton: {
    borderWidth: 1,
    width: '100%',
    borderColor: '#0080FF',
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  dailyButtonText: {
    color: '#0080FF',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
practiceBtn: {
  backgroundColor: '#F5F0FF',
  width: '45%',
  borderRadius: 99,
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 24,
  alignItems: 'center', 
},

  historyBtn: {
    backgroundColor: '#25222B',
    width: '45%',
    borderRadius: 99,
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 24,
    alignItems: 'center', 
  },
  practiceText: {
    color: '#0080FF',
    fontWeight: '600',
    fontSize: 16,
  },
  historyText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Be Vietnam Pro',
  },
  startButtonWrapper: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  startButton: {
    width: 335,
    height: 52,
    backgroundColor: '#0080FF',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Be Vietnam Pro',
  },
});
