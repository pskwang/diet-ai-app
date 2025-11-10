import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, getUserByEmail, addUser, getUserInfo } from '../src/db/database';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDatabase();
      } catch (e) {
        console.error('DB 초기화 실패:', e);
      }
    };
    setupDB();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('⚠️', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const user = await getUserByEmail(email);
      if (user && user.password === password) {
        await AsyncStorage.setItem('userToken', email);

        // 로그인 직후 userInfo 확인
        const userInfo = await getUserInfo();
        if (!userInfo) {
          router.replace('/onboarding'); // 프로필 없으면 onboarding
        } else {
          router.replace('/tabs'); // 있으면 홈
        }
      } else {
        Alert.alert('❌ 로그인 실패', '등록되지 않은 계정이거나 비밀번호가 잘못되었습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('❌ 로그인 오류', '문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('⚠️', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    try {
      await addUser(email, password);
      Alert.alert('✅ 회원가입 완료', '이제 로그인할 수 있습니다.');
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('⚠️ 오류', '이미 등록된 이메일입니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>다이어트앱 로그인</Text>

      <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
      <TextInput style={styles.input} placeholder="비밀번호" value={password} secureTextEntry onChangeText={setPassword}/>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.subButton} onPress={handleRegister}>
        <Text style={styles.subButtonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30 },
  input: { width: '90%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, width: '90%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subButton: { marginTop: 10 },
  subButtonText: { color: '#007AFF' },
});
