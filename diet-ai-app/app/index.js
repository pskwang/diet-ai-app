import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, SafeAreaView } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { getUserInfo } from '../src/db/database'; // SQLite 데이터베이스에서 사용자 정보 가져오기

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보를 저장할 상태

  // 사용자 정보를 불러오는 비동기 함수
  const fetchUserInfo = async () => {
    try {
      const user = await getUserInfo();
      if (user) {
        setUserInfo(user); // 사용자 정보가 있으면 상태에 저장
        console.log('사용자 정보 로드 완료:', user);
      } else {
        setUserInfo(null); // 사용자 정보가 없으면 null로 설정
        console.log('사용자 정보 없음. 초기 설정 화면으로 이동.');
        router.replace('/profile/input'); // 사용자 정보가 없으면 프로필 입력 화면으로 리다이렉트
      }
    } catch (error) {
      console.error('사용자 정보 확인 중 오류:', error);
      // 오류 발생 시에도 앱 진행을 위해 로딩 상태 해제
      setUserInfo(null); // 오류 발생 시 사용자 정보 없음으로 처리
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  // 화면에 포커스될 때마다 사용자 정보를 새로고침 (프로필 입력 후 돌아올 때 유용)
  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      return () => {
        // 선택적으로 화면이 언포커스될 때 정리 작업
      };
    }, [])
  );

  // 앱 준비 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>앱 준비 중...</Text>
      </View>
    );
  }

  // 사용자 정보가 로드되었을 때 메인 앱 화면 렌더링
  return (
    <SafeAreaView style={styles.mainAppContainer}>
      <Text style={styles.mainTitle}>Diet AI App</Text>
      <Text style={styles.subtitle}>건강한 식단과 운동을 기록해보세요!</Text>

      {/* 사용자 정보가 있을 경우 표시 */}
      {userInfo && (
        <View style={styles.userDataContainer}>
          <Text style={styles.userDataText}>키: {userInfo.height} cm</Text>
          <Text style={styles.userDataText}>몸무게: {userInfo.weight} kg</Text>
          <Text style={styles.userDataText}>체형: {userInfo.body_type}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Link href="/exercise/list" asChild>
          <Button title="운동 기록 보기" />
        </Link>
        <Link href="/exercise/input" asChild style={styles.buttonSpacing}>
          <Button title="운동 기록 추가" />
        </Link>
        <Link href="/meal/list" asChild style={styles.buttonSpacing}>
          <Button title="식사 기록 보기" />
        </Link>
        <Link href="/meal/input" asChild style={styles.buttonSpacing}>
          <Button title="식사 기록 추가" />
        </Link>
        {/* 프로필 수정 링크 추가 */}
        <Link href="/profile/input" asChild style={styles.buttonSpacing}>
          <Button title="프로필 정보 수정" />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#388E3C',
  },
  mainAppContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9', // 밝은 녹색 배경
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1B5E20', // 아주 진한 녹색
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  userDataContainer: {
    backgroundColor: '#DCEDC8', // 연한 녹색 배경
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userDataText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '80%', // 버튼 컨테이너 너비 설정
  },
  buttonSpacing: {
    marginTop: 10, // 버튼 사이 간격
  },
});
