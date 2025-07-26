import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/db/database';
import { ActivityIndicator, View, StyleSheet, Text, Alert } from 'react-native';

// Firebase 관련 임포트 및 설정 제거

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // SQLite 데이터베이스 초기화만 남깁니다.
        await initDatabase();
        setIsReady(true);
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        setInitError(error);
        const errorMessage = error && error.message ? error.message : '알 수 없는 오류가 발생했습니다.';
        Alert.alert(
          '오류',
          '앱 초기화 중 문제가 발생했습니다: ' + errorMessage + '\n앱을 다시 시작해주세요.'
        );
      }
    };
    setupApp();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        {initError ? (
          <Text style={styles.errorText}>
            데이터베이스 초기화 실패: {initError && initError.message ? initError.message : '알 수 없는 오류'}
          </Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>앱 초기화 중...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
