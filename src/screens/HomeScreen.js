import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다!</Text>
      <Text style={styles.subtitle}>식단 관리를 시작해 보세요.</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="식단 입력하기"
          onPress={() => navigation.navigate('식단 입력')}
          color="#4CAF50"
        />
        <View style={styles.spacer} />
        <Button
          title="식단 목록 보기"
          onPress={() => navigation.navigate('식단 목록')}
          color="#2196F3"
        />
        <View style={styles.spacer} />
        <Button
          title="운동 기록"
          onPress={() => navigation.navigate('운동 기록')}
          color="#FF9800"
        />
        <View style={styles.spacer} />
        <Button
          title="커뮤니티"
          onPress={() => navigation.navigate('커뮤니티')}
          color="#9C27B0"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
  },
  spacer: {
    height: 15, // 버튼 사이 간격
  },
});

export default HomeScreen;
