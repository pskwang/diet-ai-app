import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExerciseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>운동 기록 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  title: {
    fontSize: 22
  }
});
