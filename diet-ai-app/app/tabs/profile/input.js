import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { setUserInfo, getUserInfo } from '../../../src/db/database'; // 경로 수정

export default function ProfileInputScreen() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const router = useRouter();

  const genderOptions = ['남성', '여성'];
  const bodyTypeOptions = ['마름', '보통', '통통'];
  const goalOptions = ['다이어트', '벌크업', '유지'];
  const periodOptions = ['3~4개월', '5~6개월', '7개월 이상'];

  const fetchCurrentInfo = async () => {
    try {
      const user = await getUserInfo();
      if (user) {
        setHeight(user.height.toString());
        setWeight(user.weight.toString());
        setSelectedGender(user.gender);
        setSelectedBodyType(user.body_type);
        setSelectedGoal(user.goal);
        setSelectedPeriod(user.period);
      }
    } catch (error) {
      console.error('프로필 정보 로드 오류:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCurrentInfo();
    }, [])
  );

  const handleSave = async () => {
    if (!height || !weight || !selectedGender || !selectedBodyType || !selectedGoal || !selectedPeriod) {
      Alert.alert('모든 정보를 입력해주세요.');
      return;
    }
    try {
      await setUserInfo(
        Number(height),
        Number(weight),
        selectedGender,
        selectedBodyType,
        selectedGoal,
        selectedPeriod
      );
      Alert.alert('저장 완료', '프로필 정보가 수정되었습니다.');
    } catch (err) {
      Alert.alert('저장 실패', err.message);
    }
  };

  const renderOptionButtons = (options, selectedOption, setOption) => (
    <View style={styles.optionButtonContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedOption === option && styles.selectedOptionButton,
          ]}
          onPress={() => setOption(option)}
        >
          <Text style={[styles.optionButtonText, selectedOption === option && styles.selectedOptionText]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>프로필 정보 수정</Text>
      
      <Text style={styles.label}>키 (cm):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholder="예: 175"
      />
      
      <Text style={styles.label}>몸무게 (kg):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="예: 70"
      />
      
      <Text style={styles.label}>성별:</Text>
      {renderOptionButtons(genderOptions, selectedGender, setSelectedGender)}

      <Text style={styles.label}>체형:</Text>
      {renderOptionButtons(bodyTypeOptions, selectedBodyType, setSelectedBodyType)}
      
      <Text style={styles.label}>목표:</Text>
      {renderOptionButtons(goalOptions, selectedGoal, setSelectedGoal)}

      <Text style={styles.label}>목표 기간:</Text>
      {renderOptionButtons(periodOptions, selectedPeriod, setSelectedPeriod)}

      <Button title="저장하기" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  optionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedOptionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});