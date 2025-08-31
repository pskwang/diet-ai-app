// app/exercise/list.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { getExercises, deleteExercise } from '../../../src/db/database'; // database.js 파일 경로에 맞게 조정
import { useFocusEffect } from 'expo-router'; // expo-router v2 이상에서 화면 포커스 시 데이터 새로고침

export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);

  const fetchExercises = async () => {
    try {
      const fetched = await getExercises();
      setExercises(fetched);
    } catch (error) {
      console.error('운동 기록 불러오기 오류:', error);
      Alert.alert('오류', '운동 기록을 불러오는 데 실패했습니다: ' + error.message);
    }
  };

  // 화면에 포커스될 때마다 데이터 새로고침 (입력 후 돌아올 때 유용)
  useFocusEffect(
    useCallback(() => {
      fetchExercises();
      return () => {
        // 선택적으로 화면이 언포커스될 때 정리 작업
      };
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert(
      '삭제 확인',
      '이 운동 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await deleteExercise(id);
              Alert.alert('삭제 완료', '운동 기록이 삭제되었습니다.');
              fetchExercises(); // 삭제 후 목록 새로고침
            } catch (error) {
              console.error('운동 기록 삭제 오류:', error);
              Alert.alert('오류', '운동 기록 삭제에 실패했습니다: ' + error.message);
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
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemText}>종류: {item.type}</Text>
        <Text style={styles.itemText}>시간: {item.duration}분</Text>
        <Text style={styles.itemText}>칼로리: {item.calories} kcal</Text>
      </View>
      <Button title="삭제" onPress={() => handleDelete(item.id)} color="#ff6347" />
    </View>
  );

  return (
    <View style={styles.container}>
      {exercises.length === 0 ? (
        <Text style={styles.emptyText}>아직 운동 기록이 없습니다. 추가해보세요!</Text>
      ) : (
        <FlatList
          data={exercises}
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
    paddingBottom: 20, // 하단 여백 추가
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
  itemText: {
    fontSize: 16,
    marginBottom: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});