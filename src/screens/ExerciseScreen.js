import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function ExerciseScreen() {
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');

  const handleSave = () => {
    if (!exercise || !duration) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    Alert.alert('저장 완료', `${exercise} - ${duration}분`);
    setExercise('');
    setDuration('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>운동 이름</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 러닝, 스쿼트"
        value={exercise}
        onChangeText={setExercise}
      />
      <Text style={styles.label}>운동 시간 (분)</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 30"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
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

import { insertExercise } from '../db/database';

const handleSave = () => {
  insertExercise(exercise, parseInt(duration));
  Alert.alert('저장 완료', `${exercise} - ${duration}분`);
};

import { getExercises } from '../db/database';

const [exerciseList, setExerciseList] = useState([]);

useEffect(() => {
  loadExercises();
}, []);

const loadExercises = () => {
  getExercises((data) => setExerciseList(data));
};

<FlatList
  data={exerciseList}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Text>{item.name} - {item.duration}분</Text>
  )}
/>
