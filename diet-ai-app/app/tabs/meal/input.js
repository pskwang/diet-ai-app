import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { addMeal } from '../../../src/db/database';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MealInputScreen() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const router = useRouter();

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // 날짜를 YYYY-MM-DD 형식의 문자열로 얻는 헬퍼 함수
  const getFormattedDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = getFormattedDate(date);

  const handleAddMeal = async () => {
    if (!type || !foodName || !quantity) {
      Alert.alert('오류', '필수 필드(식사 종류, 음식 이름, 양)를 입력해주세요.');
      return;
    }

    // AI가 계산할 때까지 칼로리, 단백질, 탄수화물, 지방은 0으로 임시 저장
    const parsedCalories = 0;
    const parsedProtein = 0;
    const parsedCarbs = 0;
    const parsedFat = 0;

    try {
      // 🚨 수정: addMeal이 저장된 레코드의 ID를 반환합니다.
      const mealId = await addMeal(
        formattedDate,
        type,
        foodName,
        quantity,
        parsedCalories,
        parsedProtein,
        parsedCarbs,
        parsedFat
      );

      // AI 챗봇에게 분석 요청을 유도합니다.
      Alert.alert(
        '성공', 
        `식사 기록이 추가되었습니다 (ID: ${mealId}). AI 챗봇 탭에서 '오늘 식단 분석해줘'라고 물어보세요!`
      );
      
      setType('');
      setFoodName('');
      setQuantity('');
      router.back();

    } catch (error) {
      console.error('식사 기록 추가 오류:', error);
      Alert.alert('오류', '식사 기록 추가에 실패했습니다: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.label}>날짜:</Text>
        <TouchableOpacity onPress={showDatepicker}>
          <TextInput
            style={styles.input}
            value={formattedDate}
            editable={false}
            placeholder="날짜 선택"
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

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
          placeholder="예: 200g, 1개"
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
