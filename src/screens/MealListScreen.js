import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getMeals, deleteMeal } from '../db/database';

const MealListScreen = () => {
  const [meals, setMeals] = useState([]);

  const loadMeals = async () => {
    try {
      const data = await getMeals(); // ✅ Promise 처리
      setMeals(data);
    } catch (error) {
      console.error('식단 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    loadMeals(); // ✅ useEffect에서 직접 호출
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteMeal(id);
      loadMeals(); // 삭제 후 새로고침
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.date} - {item.mealType}</Text>
      <Text>{item.food} - {item.calories}kcal</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.delete}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  delete: {
    color: 'red',
    marginTop: 4,
  },
});

export default MealListScreen;
