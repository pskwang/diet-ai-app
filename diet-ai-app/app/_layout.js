// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../src/db/database'; // database.js 파일 경로에 맞게 조정

export default function Layout() {
  useEffect(() => {
    // 앱이 처음 로드될 때 데이터베이스 초기화
    initDatabase()
      .then(() => {
        console.log('Database initialized successfully in _layout.js');
      })
      .catch(err => {
        console.error('Failed to initialize database:', err);
        // 에러 처리: 사용자에게 알리거나 앱 종료 등
      });
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨

  return (
    <Stack>
      {/* <Stack.Screen />을 사용하여 각 라우트의 옵션을 설정할 수 있습니다.
        예: <Stack.Screen name="index" options={{ headerShown: false }} />
        name은 app 폴더 내의 파일명과 일치해야 합니다. (예: app/index.js -> name="index")
      */}
      <Stack.Screen name="index" options={{ title: '환영합니다!' }} />
      <Stack.Screen name="exercise/index" options={{ title: '운동 기록' }} />
      <Stack.Screen name="exercise/input" options={{ title: '운동 추가' }} />
      <Stack.Screen name="exercise/list" options={{ title: '운동 목록' }} />
      <Stack.Screen name="meal/index" options={{ title: '식사 기록' }} />
      <Stack.Screen name="meal/input" options={{ title: '식사 추가' }} />
      <Stack.Screen name="meal/list" options={{ title: '식사 목록' }} />
    </Stack>
  );
}