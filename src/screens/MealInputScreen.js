import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { insertMeal } from '../db/database'; // insertMeal 함수 임포트
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅 임포트

const MealInputScreen = () => {
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const navigation = useNavigation(); // navigation 훅 사용

  const handleAddMeal = async () => { // async 함수로 변경
    if (!date || !mealType || !food || !calories) {
      Alert.alert('경고', '모든 필드를 입력해주세요.');
      return;
    }

    const newMeal = {
      date,
      mealType,
      food,
      calories: parseInt(calories), // 칼로리는 숫자로 변환
    };

    try {
      await insertMeal(newMeal); // Promise를 await
      Alert.alert('성공', '식단이 성공적으로 추가되었습니다!');
      // 입력 필드 초기화
      setDate('');
      setMealType('');
      setFood('');
      setCalories('');
      navigation.goBack(); // 저장 후 이전 화면으로 돌아가기
    } catch (error) {
      console.error('식단 추가 중 오류 발생:', error);
      Alert.alert('오류', '식단 추가에 실패했습니다: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>새 식단 입력</Text> {/* 제목 추가 */}
      <TextInput
        style={styles.input}
        placeholder="날짜 (예: 2023-07-26)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="식사 종류 (예: 아침, 점심, 저녁)"
        value={mealType}
        onChangeText={setMealType}
      />
      <TextInput
        style={styles.input}
        placeholder="음식"
        value={food}
        onChangeText={setFood}
      />
      <TextInput
        style={styles.input}
        placeholder="칼로리"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />
      <Button title="저장" onPress={handleAddMeal} color="#4CAF50" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { // 제목 스타일 추가
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default MealInputScreen;
