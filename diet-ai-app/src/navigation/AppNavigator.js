// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MealInputScreen from '../screens/MealInputScreen';
import MealListScreen from '../screens/MealListScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="홈" component={HomeScreen} />
      <Stack.Screen name="식단 입력" component={MealInputScreen} />
      <Stack.Screen name="식단 목록" component={MealListScreen} />
    </Stack.Navigator>
  );
}
import ExerciseInputScreen from '../screens/ExerciseInputScreen';
import ExerciseListScreen from '../screens/ExerciseListScreen';

<Stack.Screen name="운동 입력" component={ExerciseInputScreen} />
<Stack.Screen name="운동 목록" component={ExerciseListScreen} />
