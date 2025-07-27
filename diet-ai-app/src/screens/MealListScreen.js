// src/screens/MealListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getMeals, deleteMeal } from '../db/database';

export default function MealListScreen() {
  const [meals, setMeals] = useState([]);

  const loadMeals = () => getMeals(setMeals);

  useEffect(() => {
    const unsubscribe = loadMeals();
    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    deleteMeal(id);
    loadMeals();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.calories} kcal</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.delete}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 18, fontWeight: 'bold' },
  delete: { color: 'red', fontWeight: 'bold' },
});
