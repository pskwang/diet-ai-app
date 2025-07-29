// app/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { getUserInfo } from '../src/db/database'; // ✅ 기존 함수 그대로 사용

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        const user = await getUserInfo();
        if (!user) {
          // 사용자 정보가 없으면 'app/profile/input.js' 화면으로 이동합니다.
          // 이 화면은 체형 선택이 버튼으로 구현되어 있습니다.
          router.replace('/profile/input');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('사용자 정보 확인 중 오류:', error);
        setLoading(false);
      }
    };
    checkUserInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diet AI App</Text>
      <Text style={styles.subtitle}>건강한 식단과 운동을 기록해보세요!</Text>

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
      </View>
    </View>
  );
}

// app/index.js 파일의 맨 아래에 추가
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // 추가: 가운데 정렬을 위해
    padding: 20,
  },
  title: {
    fontSize: 28, // 약간 크게
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // 색상 추가
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%', // 버튼 컨테이너 너비 설정
  },
  buttonSpacing: {
    marginTop: 10, // 버튼 사이 간격
  },
});
