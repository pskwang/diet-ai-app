// src/screens/MealInputScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { insertMeal } from '../db/database';

export default function MealInputScreen({ navigation }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  const handleSave = () => {
    insertMeal(name, parseInt(calories), () => {
      setName('');
      setCalories('');
      navigation.navigate('식단 목록');
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="음식 이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="칼로리"
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
