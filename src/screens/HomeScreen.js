import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다!</Text>
      <Text style={styles.subtitle}>AI가 도와주는 다이어트 앱</Text>

     <Button title="식단 기록하기" onPress={() => navigation.navigate('Diet')} />
     <Button title="운동 기록하기" onPress={() => navigation.navigate('Exercise')} />
     <Button title="AI 추천 받기" onPress={() => navigation.navigate('AIRecommendation')} />
     <Button title="커뮤니티 보기" onPress={() => navigation.navigate('Community')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  title: {
    fontSize: 28, fontWeight: 'bold', marginBottom: 10
  },
  subtitle: {
    fontSize: 16, color: '#666', marginBottom: 30
  }
});
