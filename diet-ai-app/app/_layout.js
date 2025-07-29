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
      {/*
        모든 Stack.Screen 컴포넌트는 Stack 컴포넌트 내부에 있어야 합니다.
        name은 app 폴더 내의 파일/폴더명과 일치해야 합니다.
        예: app/index.js -> name="index"
        app/profile/input.js -> name="profile/input"
        app/user/setup.js -> name="user/setup"

        주의: '기본 정보 입력' 화면이 profile/input.js 와 user/setup.js 두 곳에 있다면
        하나는 제거하거나, 한 곳만 사용하도록 앱 로직을 통일하는 것이 좋습니다.
        여기서는 일단 모두 포함하되, 실제 앱에서는 하나만 사용하시길 권장합니다.
      */}

      {/* user/setup.js 또는 onboarding.js 중 하나를 초기 정보 입력 화면으로 사용하고
          다른 하나는 제거하거나 목적에 맞게 변경하세요.
          여기서는 두 라우트 모두 임시로 포함합니다. */}
      <Stack.Screen name="user/setup" options={{ title: '기본 정보 입력' }} />
      <Stack.Screen name="profile/input" options={{ title: '프로필 정보 입력/수정' }} /> {/* 제목 변경 */}

      <Stack.Screen name="index" options={{ title: '환영합니다!' }} />

      {/* exercise/index.js는 일반적으로 exercise/list 와 중복되므로,
          리스트가 메인이라면 exercise/index 대신 exercise/list를 사용하거나
          필요에 따라 명확히 구분하세요. 여기서는 일단 포함합니다. */}
      <Stack.Screen name="exercise/index" options={{ title: '운동' }} />
      <Stack.Screen name="exercise/input" options={{ title: '운동 추가' }} />
      <Stack.Screen name="exercise/list" options={{ title: '운동 목록' }} />

      {/* meal/index.js도 exercise/index와 유사하게 고려하세요. */}
      <Stack.Screen name="meal/index" options={{ title: '식사' }} />
      <Stack.Screen name="meal/input" options={{ title: '식사 추가' }} />
      <Stack.Screen name="meal/list" options={{ title: '식사 목록' }} />

      <Stack.Screen name="onboarding" options={{ title: '정보 입력', headerShown: false }} />

    </Stack>
  );
}