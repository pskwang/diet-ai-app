// app/exercise/input.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addExercise } from '../../src/db/database'; // database.js 파일 경로에 맞게 조정
import { router } from 'expo-router'; // 라우터 객체 임포트

export default function ExerciseInputScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleAddExercise = async () => {
    if (!type || !duration || !calories) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      const parsedDuration = parseInt(duration, 10);
      const parsedCalories = parseInt(calories, 10);

      if (isNaN(parsedDuration) || isNaN(parsedCalories) || parsedDuration <= 0 || parsedCalories <= 0) {
        Alert.alert('오류', '지속 시간과 칼로리는 유효한 양의 숫자를 입력해주세요.');
        return;
      }

      await addExercise(date, type, parsedDuration, parsedCalories);
      Alert.alert('성공', '운동 기록이 추가되었습니다.');
      
      // 입력 필드 초기화
      setType('');
      setDuration('');
      setCalories('');

      router.back(); // 이전 화면으로 돌아가기 (보통 운동 목록 화면)

    } catch (error) {
      console.error('운동 기록 추가 오류:', error);
      Alert.alert('오류', '운동 기록 추가에 실패했습니다: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜:</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} keyboardType="numeric" />

      <Text style={styles.label}>운동 종류:</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="예: 런닝, 웨이트"
      />

      <Text style={styles.label}>지속 시간 (분):</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder="예: 30"
      />

      <Text style={styles.label}>소모 칼로리 (kcal):</Text>
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        placeholder="예: 300"
      />

      <Button title="운동 기록 추가" onPress={handleAddExercise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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