import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Button } from 'react-native';
import { getUserInfo, getExercises, getMeals } from '../../src/db/database';
import { useFocusEffect, Link } from 'expo-router';

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const user = await getUserInfo();
      const fetchedExercises = await getExercises();
      const fetchedMeals = await getMeals();

      setUserInfo(user);
      setExercises(fetchedExercises);
      setMeals(fetchedMeals);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const getTodaysData = (data) => {
    const today = new Date().toISOString().split('T')[0];
    return data.filter(item => item.date === today);
  };

  const todaysExercises = getTodaysData(exercises);
  const todaysMeals = getTodaysData(meals);

  const totalCalories = todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalExerciseCalories = todaysExercises.reduce((sum, exercise) => sum + (exercise.calories || 0), 0);
  const totalExerciseDuration = todaysExercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>안녕하세요!</Text>
      {userInfo && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>키: {userInfo.height} cm</Text>
          <Text style={styles.userInfoText}>몸무게: {userInfo.weight} kg</Text>
          <Text style={styles.userInfoText}>성별: {userInfo.gender}</Text>
          <Text style={styles.userInfoText}>목표: {userInfo.goal}</Text>
          <Text style={styles.userInfoText}>기간: {userInfo.period}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘의 기록</Text>
        <Text style={styles.sectionContent}>
          {todaysMeals.length > 0 ? `섭취 칼로리: ${totalCalories} kcal` : '오늘 식사 기록이 없습니다.'}
        </Text>
        <Text style={styles.sectionContent}>
          {todaysExercises.length > 0 ? `운동 시간: ${totalExerciseDuration}분, 소모 칼로리: ${totalExerciseCalories} kcal` : '오늘 운동 기록이 없습니다.'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>지난 기록 대비</Text>
        <Text style={styles.sectionContent}>
          여기에 지난 기록과 비교하는 그래프를 표시합니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfoContainer: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});
