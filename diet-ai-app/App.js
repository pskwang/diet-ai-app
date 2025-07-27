import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/index';
import MealInput from './app/meal/input';
import MealList from './app/meal/list';
import ExerciseInput from './app/exercise/input';
import ExerciseList from './app/exercise/list';
import { createTables } from './app/db/database';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    createTables();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="홈">
        <Stack.Screen name="홈" component={HomeScreen} />
        <Stack.Screen name="식단 입력" component={MealInput} />
        <Stack.Screen name="식단 목록" component={MealList} />
        <Stack.Screen name="운동 입력" component={ExerciseInput} />
        <Stack.Screen name="운동 목록" component={ExerciseList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
