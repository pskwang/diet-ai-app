import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { insertExercise } from '../../src/db/database';

export default function ExerciseInputScreen() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    insertExercise(name, parseInt(duration), parseInt(calories), () => {
      alert('운동 저장 완료');
      setName('');
      setDuration('');
      setCalories('');
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="운동 이름" value={name} onChangeText={setName} />
      <TextInput placeholder="운동 시간 (분)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <TextInput placeholder="칼로리" value={calories} onChangeText={setCalories} keyboardType="numeric" />
      <Button title="저장" onPress={handleSubmit} />
    </View>
  );
}
