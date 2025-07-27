import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getExercises, deleteExercise } from '../db/database';

export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    getExercises(setExercises);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {exercises.map((ex) => (
        <View key={ex.id} style={{ marginBottom: 10 }}>
          <Text>{ex.name} - {ex.duration}분 - {ex.calories}kcal</Text>
          <Button title="삭제" onPress={() => {
            deleteExercise(ex.id);
            getExercises(setExercises);
          }} />
        </View>
      ))}
    </View>
  );
}
