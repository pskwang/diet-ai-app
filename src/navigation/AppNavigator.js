import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MealInputScreen from '../screens/MealInputScreen';
import MealListScreen from '../screens/MealListScreen';
import ExerciseScreen from '../screens/ExerciseScreen'; // 운동 기록 화면 임포트
import CommunityScreen from '../screens/CommunityScreen'; // 커뮤니티 화면 임포트

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home"> {/* 초기 화면을 홈으로 변경 */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Stack.Screen name="식단 입력" component={MealInputScreen} options={{ title: '식단 입력' }} />
      <Stack.Screen name="식단 목록" component={MealListScreen} options={{ title: '식단 목록' }} />
      <Stack.Screen name="운동 기록" component={ExerciseScreen} options={{ title: '운동 기록' }} /> {/* 운동 기록 화면 추가 */}
      <Stack.Screen name="커뮤니티" component={CommunityScreen} options={{ title: '커뮤니티' }} /> {/* 커뮤니티 화면 추가 */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
