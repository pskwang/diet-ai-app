// src/screens/ExerciseListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getExercises, deleteExercise } from '../db/database';

export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);

  const loadExercises = () => getExercises(setExercises);

  useEffect(() => {
    loadExercises();
  }, []);

  const handleDelete = (id) => {
    deleteExercise(id);
    loadExercises();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.duration}분, {item.calories} kcal</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.delete}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={exercises}
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
