import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase, getUserInfo } from '../src/db/database';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [hasUserInfo, setHasUserInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initDatabase();
        const user = await getUserInfo();
        if (user) {
          setHasUserInfo(true);
        }
      } catch (err) {
        console.error('앱 설정 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    setupApp();
  }, []);

  if (loading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={layoutStyles.loadingText}>앱 데이터 로드 중...</Text>
      </View>
    );
  }

  // 사용자 정보가 없으면 온보딩, 있으면 탭 화면을 보여줍니다.
  const initialRoute = hasUserInfo ? 'tabs' : 'onboarding';

  return (
    <Stack initialRouteName={initialRoute}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="exercise/input" options={{ presentation: 'modal', title: '운동 기록 추가' }} />
      <Stack.Screen name="meal/input" options={{ presentation: 'modal', title: '식사 기록 추가' }} />
    </Stack>
  );
}

const layoutStyles = StyleSheet.create({
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
});