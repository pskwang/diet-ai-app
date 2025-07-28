// app/meal/list.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { getMeals, deleteMeal } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';

export default function MealListScreen() {
  const [meals, setMeals] = useState([]);

  const fetchMeals = async () => {
    try {
      const fetched = await getMeals();
      setMeals(fetched);
    } catch (error) {
      console.error('식사 기록 불러오기 오류:', error);
      Alert.alert('오류', '식사 기록을 불러오는 데 실패했습니다: ' + error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
      return () => {};
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert(
      '삭제 확인',
      '이 식사 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await deleteMeal(id);
              Alert.alert('삭제 완료', '식사 기록이 삭제되었습니다.');
              fetchMeals();
            } catch (error) {
              console.error('식사 기록 삭제 오류:', error);
              Alert.alert('오류', '식사 기록 삭제에 실패했습니다: ' + error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemDate}>{item.date} - {item.type}</Text>
        <Text style={styles.itemFoodName}>{item.food_name} {item.quantity ? `(${item.quantity})` : ''}</Text>
        <Text style={styles.itemNutrients}>
          칼로리: {item.calories} kcal
          {item.protein ? `, 단백질: ${item.protein}g` : ''}
          {item.carbs ? `, 탄수화물: ${item.carbs}g` : ''}
          {item.fat ? `, 지방: ${item.fat}g` : ''}
        </Text>
      </View>
      <Button title="삭제" onPress={() => handleDelete(item.id)} color="#ff6347" />
    </View>
  );

  return (
    <View style={styles.container}>
      {meals.length === 0 ? (
        <Text style={styles.emptyText}>아직 식사 기록이 없습니다. 추가해보세요!</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  itemFoodName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  itemNutrients: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});