import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>다이어트 홈</Text>
      <Button title="식단 입력" onPress={() => navigation.navigate('MealInput')} />
      <Button title="운동 기록" onPress={() => navigation.navigate('Exercise')} />
      <Button title="커뮤니티" onPress={() => navigation.navigate('Community')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20
  },
  title: {
    fontSize: 24, marginBottom: 30
  }
});
