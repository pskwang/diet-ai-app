import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function DietScreen() {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');

  const handleSave = () => {
    if (!meal || !calories) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    Alert.alert('저장 완료', `${meal} - ${calories} kcal`);
    setMeal('');
    setCalories('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>식단 내용</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 닭가슴살, 고구마"
        value={meal}
        onChangeText={setMeal}
      />
      <Text style={styles.label}>칼로리 (kcal)</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 350"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />
      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 10
  }
});

import { insertMeal } from '../db/database';

const handleSave = () => {
  insertMeal(meal, parseInt(calories));
  Alert.alert('저장 완료', `${meal} - ${calories} kcal`);
};

import { getMeals } from '../db/database';
import { useEffect, useState } from 'react';

const [mealList, setMealList] = useState([]);

useEffect(() => {
  loadMeals();
}, []);

const loadMeals = () => {
  getMeals((data) => setMealList(data));
};

<FlatList
  data={mealList}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Text>{item.name} - {item.calories} kcal</Text>
  )}
/>
