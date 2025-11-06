import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getMeals, deleteMeal } from '../../../src/db/database';
import { useFocusEffect, Link } from 'expo-router'; 
import { Calendar } from 'react-native-calendars';

export default function MealListScreen() {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true); 

  const fetchMeals = useCallback(async () => {
    setLoading(true); 
    try {
      const fetched = await getMeals();
      setMeals(fetched);
      console.log("✅ MealListScreen: Meals reloaded due to focus. Total meals:", fetched.length);
      // 이제 칼로리 0 체크 로깅은 필요 없습니다.
    } catch (error) {
      console.error('❌ 식사 기록 불러오기 오류:', error);
      Alert.alert('오류', '식사 기록을 불러오는 데 실패했습니다: ' + error.message);
    } finally {
      setLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
      
      const today = new Date().toISOString().slice(0, 10);
      setSelectedDate(today);

      return () => {}; 
    }, [fetchMeals]) 
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
              console.error('❌ 식사 기록 삭제 오류:', error);
              Alert.alert('오류', '식사 기록 삭제에 실패했습니다: ' + error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    console.log("Selected date:", day.dateString);
  };

  const filteredMeals = meals.filter(meal => meal.date === selectedDate);

  const markedDates = meals.reduce((acc, meal) => {
    acc[meal.date] = { marked: true, dotColor: '#007AFF' }; 
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = { 
      ...(markedDates[selectedDate] || {}), 
      selected: true, 
      disableTouchEvent: true, 
      selectedDotColor: 'orange', 
      selectedColor: '#e0e0e0' 
    };
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemDate}>{item.date} - {item.type}</Text>
        {/* ✅ 음식 이름과 양만 표시 */}
        <Text style={styles.itemFoodName}>{item.food_name} {item.quantity ? `(${item.quantity})` : ''}</Text>
        {/* ✅ 칼로리 및 분석 대기 중 메시지 제거 */}
      </View>
      <Button title="삭제" onPress={() => handleDelete(item.id)} color="#ff6347" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates} 
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          textDayFontFamily: 'monospace',
          textMonthFontFamily: 'monospace',
          textDayHeaderFontFamily: 'monospace',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
      />
      <View style={styles.addButtonContainer}>
        <Link href="/tabs/meal/input" asChild>
          <TouchableOpacity style={styles.customAddButton}>
            <Text style={styles.customAddButtonText}>식사 기록 추가</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? ( 
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          {selectedDate && <Text style={styles.recordTitle}>{selectedDate} 식사 기록</Text>}
          {filteredMeals.length === 0 ? (
            <Text style={styles.emptyText}>선택한 날짜에 식사 기록이 없습니다.</Text>
          ) : (
            <FlatList
              data={filteredMeals}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
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
  // itemNutrients: { // 이 스타일은 더 이상 사용되지 않습니다.
  //   fontSize: 14,
  //   color: '#555',
  // },
  // itemNutrientsPending: { // 이 스타일도 더 이상 사용되지 않습니다.
  //   fontSize: 14,
  //   color: '#FF9500', 
  //   fontStyle: 'italic',
  // },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  addButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  customAddButton: { 
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  customAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingIndicator: { 
    marginTop: 50,
  }
});