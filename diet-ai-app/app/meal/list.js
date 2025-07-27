import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getMeals, deleteMeal } from '../db/database';

export default function MealListScreen() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    getMeals(setMeals);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {meals.map((meal) => (
        <View key={meal.id} style={{ marginBottom: 10 }}>
          <Text>{meal.name} - {meal.calories}kcal</Text>
          <Button title="삭제" onPress={() => {
            deleteMeal(meal.id);
            getMeals(setMeals);
          }} />
        </View>
      ))}
    </View>
  );
}
