import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
import { useEffect } from 'react';
import { createTables } from './src/db/database';

useEffect(() => {
  createTables(); // 앱 시작 시 테이블 생성
}, []);
