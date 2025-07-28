import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getExercises, deleteExercise } from '../../src/db/database';
export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);

  const loadExercises = () => {
    getExercises(setExercises);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleDelete = (id) => {
    deleteExercise(id, () => {
      loadExercises();
    });
  };

  return (
    <View style={{ padding: 20 }}>
      {exercises.map((ex) => (
        <View key={ex.id} style={{ marginBottom: 10 }}>
          <Text>{ex.name} - {ex.duration}분 - {ex.calories}kcal</Text>
          <Button title="삭제" onPress={() => handleDelete(ex.id)} />
        </View>
      ))}
    </View>
  );
}
