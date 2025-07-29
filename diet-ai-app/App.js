import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InitialSetupScreen from './components/InitialSetupScreen'; // 위에서 만든 컴포넌트 임포트

export default function App() {
  const [appReady, setAppReady] = useState(false); // 앱 준비 상태 (로딩 스피너용)
  const [isSetupComplete, setIsSetupComplete] = useState(false); // 초기 설정 완료 여부
  const [userData, setUserData] = useState(null); // 사용자 데이터 (키, 몸무게, 체형)

  useEffect(() => {
    /**
     * 앱 시작 시 AsyncStorage에서 사용자 설정 완료 상태를 확인합니다.
     */
    const checkSetupStatus = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // isSetupComplete 플래그가 true이면 설정이 완료된 것으로 간주
          if (parsedData.isSetupComplete) {
            setIsSetupComplete(true);
            setUserData(parsedData);
            console.log('기존 사용자 데이터 로드:', parsedData);
          }
        }
      } catch (e) {
        console.error('설정 상태 확인 중 오류 발생:', e);
        // 오류 발생 시에도 앱을 계속 진행 (초기 설정 화면 표시)
      } finally {
        setAppReady(true); // 앱 준비 완료
      }
    };

    checkSetupStatus();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  /**
   * InitialSetupScreen에서 설정이 완료되었을 때 호출되는 콜백 함수입니다.
   * @param {Object} data - 저장된 사용자 데이터
   */
  const handleSetupComplete = (data) => {
    setUserData(data);
    setIsSetupComplete(true);
  };

  // 앱이 준비되지 않았다면 로딩 스피너 표시
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>앱 준비 중...</Text>
      </View>
    );
  }

  // 초기 설정이 완료되지 않았다면 InitialSetupScreen 렌더링
  if (!isSetupComplete) {
    return <InitialSetupScreen onSetupComplete={handleSetupComplete} />;
  } else {
    // 초기 설정이 완료되었다면 메인 앱 화면 렌더링
    // userData를 MainAppScreen으로 전달하여 활용할 수 있습니다.
    return <MainAppScreen userData={userData} />;
  }
}

// --- 메인 앱 화면 컴포넌트 (예시) ---
// 실제 앱에서는 이 부분을 앱의 주요 기능이 있는 화면으로 대체합니다.
const MainAppScreen = ({ userData }) => {
  return (
    <SafeAreaView style={styles.mainAppContainer}>
      <Text style={styles.mainTitle}>환영합니다!</Text>
      {userData && (
        <View style={styles.userDataContainer}>
          <Text style={styles.userDataText}>키: {userData.height} cm</Text>
          <Text style={styles.userDataText}>몸무게: {userData.weight} kg</Text>
          <Text style={styles.userDataText}>체형: {userData.bodyType}</Text>
        </View>
      )}
      <Text style={styles.instructionText}>
        여기에 당신의 다이어트 AI 앱의 주요 기능들이 들어갑니다.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#388E3C',
  },
  mainAppContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9', // 밝은 녹색 배경
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1B5E20', // 아주 진한 녹색
    textAlign: 'center',
  },
  userDataContainer: {
    backgroundColor: '#DCEDC8', // 연한 녹색 배경
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userDataText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
  },
});
