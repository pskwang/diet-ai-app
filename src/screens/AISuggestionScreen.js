import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function AISuggestionScreen() {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = () => {
    // 이 부분은 나중에 ChatGPT API 요청으로 바뀔 수 있습니다.
    const dummyData = [
      '아침: 닭가슴살 + 고구마 + 브로콜리',
      '점심: 현미밥 + 연어구이 + 샐러드',
      '저녁: 두부샐러드 + 바나나',
      '운동: 스트레칭 + 30분 유산소',
    ];
    setSuggestions(dummyData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 추천 결과</Text>
      <Button title="AI 추천 받기" onPress={fetchSuggestions} />
      <ScrollView style={styles.resultBox}>
        {suggestions.map((item, index) => (
          <Text key={index} style={styles.suggestion}>{`\u2022 ${item}`}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  resultBox: { marginTop: 20 },
  suggestion: { fontSize: 16, marginBottom: 10 },
});

import { getMeals, getExercises } from '../db/database';
import { useEffect, useState } from 'react';

const [meals, setMeals] = useState([]);
const [exercises, setExercises] = useState([]);

useEffect(() => {
  getMeals(setMeals);
  getExercises(setExercises);
}, []);

<View>
  <Text>📋 최근 식단:</Text>
  {meals.map(m => (
    <Text key={m.id}>{m.name} - {m.calories} kcal</Text>
  ))}

  <Text style={{ marginTop: 10 }}>💪 최근 운동:</Text>
  {exercises.map(e => (
    <Text key={e.id}>{e.name} - {e.duration}분</Text>
  ))}
</View>
