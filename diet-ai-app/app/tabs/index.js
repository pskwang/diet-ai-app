import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Button } from 'react-native';
import { getUserInfo } from '../../src/db/database';
import { useFocusEffect, Link } from 'expo-router';

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const user = await getUserInfo();
      setUserInfo(user);
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [])
  );

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

      {/* 여기에 오늘 먹은 양, 운동량, 그래프 등을 추가 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘의 기록</Text>
        <Text style={styles.sectionContent}>
          이 부분에 오늘 섭취 칼로리, 운동 소모 칼로리 등을 표시합니다.
          (예: 식사: 1500 kcal, 운동: 300 kcal)
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>지난 기록 대비</Text>
        <Text style={styles.sectionContent}>
          여기에 지난 기록과 비교하는 그래프를 표시합니다.
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <Link href="/exercise/input" asChild>
          <Button title="운동 기록 추가" />
        </Link>
        <Link href="/meal/input" asChild>
          <Button title="식사 기록 추가" />
        </Link>
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