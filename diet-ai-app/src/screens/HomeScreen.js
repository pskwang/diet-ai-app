// src/screens/HomeScreen.js
import React from 'react';
import { View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="식단 입력" onPress={() => navigation.navigate('식단 입력')} />
      <View style={{ height: 20 }} />
      <Button title="식단 목록" onPress={() => navigation.navigate('식단 목록')} />
    </View>
  );
}
<Button title="운동 입력" onPress={() => navigation.navigate('운동 입력')} />
<View style={{ height: 20 }} />
<Button title="운동 목록" onPress={() => navigation.navigate('운동 목록')} />
