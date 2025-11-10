// app/index.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken'); // 로그인 유지용 토큰
        if (userToken) {
          router.replace('/home'); // 로그인 되어 있으면 홈 화면
        } else {
          router.replace('/login'); // 로그인 안 되어 있으면 로그인 화면
        }
      } catch (e) {
        console.error('로그인 체크 오류:', e);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return null;
}
