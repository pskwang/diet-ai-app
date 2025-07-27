// src/screens/ExerciseInputScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { insertExercise } from '../db/database';

export default function ExerciseInputScreen({ navigation }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleSave = () => {
    insertExercise(name, parseInt(duration), parseInt(calories), () => {
      setName('');
      setDuration('');
      setCalories('');
      navigation.navigate('운동 목록');
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="운동 이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="운동 시간 (분)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="소모 칼로리"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
});
