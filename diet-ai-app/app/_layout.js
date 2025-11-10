import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, getUserInfo } from '../src/db/database';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('login');

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initDatabase();

        const token = await AsyncStorage.getItem('userToken');
        const userInfo = await getUserInfo();

        if (!token) {
          // 토큰 없으면 로그인
          setInitialRoute('login');
        } else if (!userInfo) {
          // 로그인은 되었지만 프로필 없으면 onboarding
          setInitialRoute('onboarding');
        } else {
          // 로그인+프로필 모두 있으면 홈(tabs)
          setInitialRoute('tabs');
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

  return (
    <Stack initialRouteName={initialRoute}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="tabs/exercise/input"
        options={{ presentation: 'modal', title: '운동 기록 추가' }}
      />
      <Stack.Screen
        name="tabs/meal/input"
        options={{ presentation: 'modal', title: '식사 기록 추가' }}
      />
    </Stack>
  );
}

const layoutStyles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#388E3C' },
});
