import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { getUserInfo, getExercises, getMeals } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], intake: [], burned: [], duration: [] });

  const fetchAllData = async () => {
    try {
      const user = await getUserInfo();
      const fetchedExercises = await getExercises();
      const fetchedMeals = await getMeals();

      setUserInfo(user);
      setExercises(fetchedExercises);
      setMeals(fetchedMeals);
      
      processChartData(fetchedExercises, fetchedMeals); 

    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 그래프 데이터 가공 함수
  const processChartData = (exercises, meals) => {
    const dataByDate = {};
    const today = new Date();
    
    // 7일치 날짜 초기화 (최근 7일)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dataByDate[dateString] = { totalIntake: 0, totalBurned: 0, totalDuration: 0, label: d.getMonth() + 1 + '/' + d.getDate() };
    }

    // 운동 데이터 통합 (소모 칼로리)
    exercises.forEach(e => {
      if (dataByDate[e.date]) {
        dataByDate[e.date].totalDuration += (e.duration || 0);
        dataByDate[e.date].totalBurned += (e.calories || 0); 
      }
    });

    // 식단 데이터 통합 (섭취 칼로리)
    meals.forEach(m => {
      if (dataByDate[m.date]) {
        dataByDate[m.date].totalIntake += (m.calories || 0); 
      }
    });
    
    // 최종 차트 데이터 포맷
    const dates = Object.keys(dataByDate).sort();
    const finalChartData = {
      labels: dates.map(date => dataByDate[date].label),
      intake: dates.map(date => dataByDate[date].totalIntake), // 섭취 칼로리
      burned: dates.map(date => dataByDate[date].totalBurned), // 소모 칼로리
      duration: dates.map(date => dataByDate[date].totalDuration), // 순수 운동 시간
    };
    
    setChartData(finalChartData);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const getTodaysData = (data) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return data.filter(item => item.date === dateString);
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

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 기본 라벨 색상
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.5,
    propsForLabels: {
      fontSize: 10,
    },
  };
  
  // BarChart는 datasets에 여러 배열을 넣어 그룹 막대 차트를 구현합니다.
  const calorieChartData = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.intake, // 섭취 칼로리 (파란색)
        color: (opacity = 1) => `rgba(255, 127, 80, ${opacity})`, // 주황색 (섭취)
        legend: "섭취 (kcal)"
      },
      {
        data: chartData.burned, // 소모 칼로리 (녹색)
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // 초록색 (소모)
        legend: "소모 (kcal)"
      },
    ],
  };
  
  // 운동 시간 차트 데이터
  const durationChartData = {
    labels: chartData.labels,
    datasets: [{
        data: chartData.duration, 
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // 파란색
        legend: "운동 시간 (분)"
    }]
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>안녕하세요!</Text>
      {userInfo && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>키: {userInfo.height} cm</Text>
          <Text style={styles.userInfoText}>몸무게: {userInfo.weight} kg</Text>
          <Text style={styles.userInfoText}>목표: {userInfo.goal}</Text>
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
      
      {/* 🚨 주간 섭취 vs 소모 칼로리 그래프 (이중 막대) */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>주간 칼로리 비교</Text>
        <BarChart
          data={calorieChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={{ marginVertical: 8, borderRadius: 16 }}
          yAxisLabel=""
          yAxisSuffix="kcal"
          // legend={["섭취 (kcal)", "소모 (kcal)"]} // 데이터셋에 legend를 정의했으므로 주석 처리
        />
      </View>
      
      {/* 🚨 주간 운동 시간 그래프 */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>주간 운동 시간 변화 (분)</Text>
        <BarChart
          data={durationChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={{ marginVertical: 8, borderRadius: 16 }}
          yAxisLabel=""
          yAxisSuffix="분"
          
        />
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
  chartSection: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center', // 차트 중앙 정렬
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
});
