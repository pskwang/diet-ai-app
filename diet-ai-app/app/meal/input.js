// app/meal/input.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { addMeal } from '../../src/db/database';
import { router } from 'expo-router';

export default function MealInputScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState(''); // 예: 아침, 점심, 저녁, 간식
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(''); // 예: 100g, 1개
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleAddMeal = async () => {
    if (!type || !foodName || !calories) {
      Alert.alert('오류', '필수 필드(식사 종류, 음식 이름, 칼로리)를 입력해주세요.');
      return;
    }

    try {
      const parsedQuantity = parseFloat(quantity) || 0; // 숫자가 아니면 0
      const parsedCalories = parseInt(calories, 10);
      const parsedProtein = parseFloat(protein) || 0;
      const parsedCarbs = parseFloat(carbs) || 0;
      const parsedFat = parseFloat(fat) || 0;

      if (isNaN(parsedCalories) || parsedCalories <= 0) {
        Alert.alert('오류', '칼로리는 유효한 양의 숫자를 입력해주세요.');
        return;
      }

      await addMeal(
        date,
        type,
        foodName,
        parsedQuantity,
        parsedCalories,
        parsedProtein,
        parsedCarbs,
        parsedFat
      );
      Alert.alert('성공', '식사 기록이 추가되었습니다.');
      
      // 입력 필드 초기화
      setType('');
      setFoodName('');
      setQuantity('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      router.back(); // 이전 화면으로 돌아가기 (식사 목록 화면)

    } catch (error) {
      console.error('식사 기록 추가 오류:', error);
      Alert.alert('오류', '식사 기록 추가에 실패했습니다: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.label}>날짜:</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} keyboardType="numeric" />

        <Text style={styles.label}>식사 종류:</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="예: 아침, 점심, 저녁, 간식"
        />

        <Text style={styles.label}>음식 이름:</Text>
        <TextInput
          style={styles.input}
          value={foodName}
          onChangeText={setFoodName}
          placeholder="예: 닭가슴살 샐러드"
        />

        <Text style={styles.label}>양 (단위 포함):</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="예: 200g, 1개"
        />

        <Text style={styles.label}>칼로리 (kcal):</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="예: 350"
        />

        <Text style={styles.label}>단백질 (g):</Text>
        <TextInput
          style={styles.input}
          value={protein}
          onChangeText={setProtein}
          keyboardType="numeric"
          placeholder="예: 30"
        />

        <Text style={styles.label}>탄수화물 (g):</Text>
        <TextInput
          style={styles.input}
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
          placeholder="예: 40"
        />

        <Text style={styles.label}>지방 (g):</Text>
        <TextInput
          style={styles.input}
          value={fat}
          onChangeText={setFat}
          keyboardType="numeric"
          placeholder="예: 15"
        />

        <Button title="식사 기록 추가" onPress={handleAddMeal} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
});