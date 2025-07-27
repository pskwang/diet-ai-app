import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { insertMeal } from '../db/database';

export default function MealInputScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    insertMeal(name, parseInt(calories), (result) => {
      alert('식단 저장 완료');
      setName('');
      setCalories('');
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="음식 이름" value={name} onChangeText={setName} />
      <TextInput
        placeholder="칼로리"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />
      <Button title="저장" onPress={handleSubmit} />
    </View>
  );
}
