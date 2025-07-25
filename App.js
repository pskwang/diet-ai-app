import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';
import { createTables } from './src/db/database';

export default function App() {
  useEffect(() => {
    createTables(); // 앱 시작 시 테이블 생성
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
