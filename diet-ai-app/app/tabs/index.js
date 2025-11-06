import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { getUserInfo } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exerciseRecommendation, setExerciseRecommendation] = useState("오늘도 건강한 하루를 위해 몸을 움직여 볼까요?");
  // ✅ 칭찬/동기 부여 메시지 추가
  const [motivationalMessage, setMotivationalMessage] = useState("오늘도 목표 달성을 향해 한 걸음 더 나아갔어요!");
  // ✅ 건강 팁 배열 추가
  const healthTips = [
    "충분한 물 섭취는 신진대사를 활발하게 합니다! 💧",
    "단백질은 근육 회복과 성장에 필수적이에요! 💪",
    "매일 30분 걷기로 심혈관 건강을 지키세요! 🚶‍♀️",
    "잠자리에 들기 2시간 전에는 스마트폰을 멀리하세요! 📵",
    "다양한 채소와 과일로 비타민과 미네랄을 보충하세요! 🍎🥬",
    "스트레칭은 유연성 향상과 부상 예방에 도움이 됩니다!🧘",
  ];
  const [randomTip, setRandomTip] = useState('');

  const fetchUserInfo = async () => {
    try {
      const user = await getUserInfo();
      setUserInfo(user);
      
      if (user) {
        if (user.goal === '체중 감량') {
          setExerciseRecommendation("체중 감량을 위해 유산소 운동(걷기, 조깅) 30분 어떠세요? 😊");
        } else if (user.goal === '근육 증가') {
          setExerciseRecommendation("근육 증가를 위해 스쿼트 3세트 12회, 푸쉬업 3세트 10회 추천해요! 💪");
        } else if (user.goal === '건강 유지') {
          setExerciseRecommendation("건강 유지를 위해 스트레칭과 가벼운 산책으로 활력을 찾아보세요! ✨");
        } else {
          setExerciseRecommendation("오늘도 건강한 하루를 위해 몸을 움직여 볼까요? 🤸");
        }
        setMotivationalMessage(`안녕하세요, ${user.name || '사용자'}님! 오늘도 목표 달성을 향해 한 걸음 더 나아갔어요!`);

      } else {
        setExerciseRecommendation("사용자 정보가 없습니다. '내 정보' 탭에서 목표를 설정해주세요!");
        setMotivationalMessage("안녕하세요! '내 정보' 탭에서 프로필을 설정하고 목표를 시작해 보세요!");
      }
      
      // ✅ 건강 팁 랜덤 선택
      const randomIndex = Math.floor(Math.random() * healthTips.length);
      setRandomTip(healthTips[randomIndex]);

    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      setExerciseRecommendation("정보를 불러오는 데 문제가 발생했습니다. 😥");
      setMotivationalMessage("정보를 불러오는 데 문제가 발생했습니다. 😥");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 칭찬/동기 부여 섹션 */}
      <View style={styles.motivationalSection}>
        <Text style={styles.motivationalText}>{motivationalMessage}</Text>
      </View>

      {/* 운동 추천 섹션 */}
      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationText}>{exerciseRecommendation}</Text>
      </View>
      
      {/* ✅ 건강 팁/정보 카드 섹션 */}
      {randomTip && (
        <View style={styles.healthTipSection}>
          <Text style={styles.healthTipTitle}>오늘의 건강 팁</Text>
          <Text style={styles.healthTipText}>{randomTip}</Text>
        </View>
      )}

      {/* 프로필 정보 섹션 */}
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>내 정보</Text>
        {userInfo ? (
          <>
            <Text style={styles.profileText}>키: {userInfo.height} cm</Text>
            <Text style={styles.profileText}>몸무게: {userInfo.weight} kg</Text>
            <Text style={styles.profileText}>목표: {userInfo.goal}</Text>
          </>
        ) : (
          <Text style={styles.profileText}>'내 정보' 탭에서 프로필을 입력해주세요.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start', // 상단에 정렬 (스크롤 가능성 대비)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ✅ 칭찬/동기 부여 메시지 스타일
  motivationalSection: {
    backgroundColor: '#dff0d8', // 연한 초록색 배경
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3c763d', // 진한 초록색 텍스트
    textAlign: 'center',
  },
  recommendationSection: {
    backgroundColor: '#e6ffe6', // 부드러운 초록색 배경
    padding: 25,
    borderRadius: 15,
    marginBottom: 25, // 추천 섹션과 팁 사이 간격
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745', // 초록색 텍스트
    textAlign: 'center',
    lineHeight: 25,
  },
  // ✅ 건강 팁 섹션 스타일
  healthTipSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25, // 팁과 프로필 사이 간격
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthTipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6a0dad', // 보라색 제목
    marginBottom: 10,
  },
  healthTipText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  profileText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
});