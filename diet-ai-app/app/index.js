import React from 'react';
import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { createTables } from './db/database'; // db 위치 확인!

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="식단 입력" onPress={() => router.push('/meal/input')} />
      <View style={{ height: 20 }} />
      <Button title="식단 목록" onPress={() => router.push('/meal/list')} />
      <View style={{ height: 20 }} />
      <Button title="운동 입력" onPress={() => router.push('/exercise/input')} />
      <View style={{ height: 20 }} />
      <Button title="운동 목록" onPress={() => router.push('/exercise/list')} />
    </View>
  );
}
