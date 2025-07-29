// app/profile/input.js (또는 app/onboarding.js)
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native'; // TouchableOpacity 추가
import { useRouter } from 'expo-router';
import { setUserInfo } from '../src/db/database'; // saveUserProfile 대신 setUserInfo 사용 가정

export default function ProfileInputScreen() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState(''); // bodyType 대신 selectedBodyType으로 변경

  const router = useRouter();

  // 체형 옵션 정의
  const bodyTypeOptions = ['마름', '보통', '통통']; // 필요한 경우 더 추가

  const handleSave = async () => {
    // 이제 bodyType은 selectedBodyType으로 대체됩니다.
    if (!height || !weight || !selectedBodyType) {
      Alert.alert('모든 값을 입력해주세요.');
      return;
    }

    try {
      // setUserInfo 함수에 selectedBodyType 전달
      await setUserInfo(Number(height), Number(weight), selectedBodyType);
      Alert.alert('저장 완료', '홈 화면으로 이동합니다.');
      router.replace('/'); // index.js로 이동
    } catch (err) {
      Alert.alert('저장 실패', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기본 정보 입력</Text>

      <TextInput
        style={styles.input}
        placeholder="키 (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="몸무게 (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      {/* 체형 선택 버튼 그룹 */}
      <Text style={styles.label}>체형 선택:</Text>
      <View style={styles.bodyTypeButtonContainer}>
        {bodyTypeOptions.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.bodyTypeButton,
              selectedBodyType === type && styles.selectedBodyTypeButton, // 선택 시 스타일 적용
            ]}
            onPress={() => setSelectedBodyType(type)} // 버튼 클릭 시 선택된 체형 업데이트
          >
            <Text
              style={[
                styles.bodyTypeButtonText,
                selectedBodyType === type && styles.selectedBodyTypeButtonText, // 선택 시 텍스트 스타일 적용
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

// 스타일 시트 (기존 스타일에 추가 및 수정)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  label: { // 새로운 스타일: 체형 선택 레이블
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bodyTypeButtonContainer: { // 새로운 스타일: 버튼들을 담을 컨테이너
    flexDirection: 'row', // 가로로 배치
    justifyContent: 'space-around', // 버튼들 사이 간격 균등하게
    marginBottom: 20,
    width: '100%',
  },
  bodyTypeButton: { // 새로운 스타일: 각 체형 버튼
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    flex: 1, // 공간을 균등하게 분배
    marginHorizontal: 5, // 버튼 사이 여백
    alignItems: 'center',
  },
  selectedBodyTypeButton: { // 새로운 스타일: 선택된 체형 버튼
    backgroundColor: '#007AFF', // 선택 시 파란색 배경
    borderColor: '#007AFF',
  },
  bodyTypeButtonText: { // 새로운 스타일: 체형 버튼 텍스트
    color: '#333',
    fontWeight: 'normal',
    fontSize: 16,
  },
  selectedBodyTypeButtonText: { // 새로운 스타일: 선택된 체형 버튼 텍스트
    color: '#fff', // 선택 시 흰색 텍스트
    fontWeight: 'bold',
  },
});