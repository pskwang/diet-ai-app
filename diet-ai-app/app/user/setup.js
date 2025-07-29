// app/user/setup.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native'; // TouchableOpacity 추가
import { useRouter } from 'expo-router';
import { setUserInfo } from '../../src/db/database'; // ✅ 정확한 경로 확인

export default function UserSetupScreen() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  // 체형 상태 변수를 selectedBodyType으로 변경합니다.
  const [selectedBodyType, setSelectedBodyType] = useState(''); // bodyType 대신 selectedBodyType으로 변경

  const router = useRouter();

  // 체형 옵션 정의
  const bodyTypeOptions = ['마름', '보통', '통통']; // 필요한 경우 더 추가

  const handleSave = async () => {
    // 이제 체형 유효성 검사는 selectedBodyType을 사용합니다.
    if (!height || !weight || !selectedBodyType) {
      Alert.alert('모든 정보를 입력해주세요.');
      return;
    }

    try {
      // setUserInfo 함수에 selectedBodyType 전달
      await setUserInfo(parseFloat(height), parseFloat(weight), selectedBodyType);
      Alert.alert('저장 완료', '메인 화면으로 이동합니다.');
      router.replace('/'); // 메인으로 이동
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      Alert.alert('저장 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기초 정보 입력</Text>
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
      {/* 기존 체형 TextInput 대신 버튼 그룹을 사용합니다. */}
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
      <Button title="저장하고 시작하기" onPress={handleSave} />
    </View>
  );
}

// ✅ styles 누락된 경우 아래 추가!
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold', // 폰트 굵기 추가
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
  },
  label: { // 체형 선택 레이블 스타일
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bodyTypeButtonContainer: { // 체형 버튼들을 담을 컨테이너 스타일
    flexDirection: 'row', // 가로로 배치
    justifyContent: 'space-around', // 버튼들 사이 간격 균등하게
    marginBottom: 20,
    width: '100%',
  },
  bodyTypeButton: { // 각 체형 버튼의 기본 스타일
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
  selectedBodyTypeButton: { // 선택된 체형 버튼의 스타일
    backgroundColor: '#007AFF', // 선택 시 파란색 배경
    borderColor: '#007AFF',
  },
  bodyTypeButtonText: { // 체형 버튼 텍스트의 기본 스타일
    color: '#333',
    fontWeight: 'normal',
    fontSize: 16,
  },
  selectedBodyTypeButtonText: { // 선택된 체형 버튼 텍스트의 스타일
    color: '#fff', // 선택 시 흰색 텍스트
    fontWeight: 'bold',
  },
});
