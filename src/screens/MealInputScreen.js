import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MealInputScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>식단 입력 화면</Text>
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
