// app/index.js
import { View, Text, StyleSheet, Button } from 'react-native';
import { Link } from 'expo-router'; // expo-router의 Link 컴포넌트 사용

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diet AI App</Text>
      <Text style={styles.subtitle}>건강한 식단과 운동을 기록해보세요!</Text>

      <View style={styles.buttonContainer}>
        <Link href="/exercise/list" asChild>
          <Button title="운동 기록 보기" />
        </Link>
        <Link href="/exercise/input" asChild style={styles.buttonSpacing}>
          <Button title="운동 기록 추가" />
        </Link>
        <Link href="/meal/list" asChild style={styles.buttonSpacing}>
          <Button title="식사 기록 보기" />
        </Link>
        <Link href="/meal/input" asChild style={styles.buttonSpacing}>
          <Button title="식사 기록 추가" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
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
  buttonSpacing: {
    marginTop: 15, // 버튼 간 간격
  },
});