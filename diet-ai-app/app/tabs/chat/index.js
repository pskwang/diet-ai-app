import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { getExercises, getMeals, getUserInfo } from '../../../src/db/database';

const CHATGPT_API_KEY = "YOUR_API_KEY_HERE"; 
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserInfo();
        const exercisesData = await getExercises();
        const mealsData = await getMeals();
        setUserInfo(user);
        setExercises(exercisesData);
        setMeals(mealsData);
  
        setMessages([
          { id: '1', text: '안녕하세요! 저는 당신의 건강 목표 달성을 도와줄 AI 코치입니다. 무엇이든 물어보세요!', sender: 'ai' },
        ]);
      } catch (error) {
        console.error("데이터 로드 오류:", error);
        Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
      }
    };
    fetchUserData();
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const userDataForAI = {
        user_info: userInfo,
        today_exercises: exercises.filter(e => e.date === today),
        today_meals: meals.filter(m => m.date === today),
        user_query: inputText
      };

      const prompt = `
        당신은 사용자의 건강 목표 달성을 돕는 AI 코치입니다.
        사용자의 다이어트 앱 데이터는 다음과 같습니다:
        - 사용자 정보: ${JSON.stringify(userDataForAI.user_info)}
        - 오늘의 운동 기록: ${JSON.stringify(userDataForAI.today_exercises)}
        - 오늘의 식사 기록: ${JSON.stringify(userDataForAI.today_meals)}
        
        사용자의 질문: "${userDataForAI.user_query}"
        
        위 데이터를 바탕으로 친절하고 전문적인 AI 코치처럼 답변해 주세요.
      `;

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      };

      const aiResponse = await fetch(CHATGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATGPT_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await aiResponse.json();

      // API 응답에 오류가 있는지 확인합니다.
      if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        const aiResponseText = responseData.choices[0].message.content;
        const aiMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        // 유효하지 않은 응답일 경우 오류 메시지를 표시합니다.
        const errorMessage = { id: (Date.now() + 1).toString(), text: 'API 응답 형식에 문제가 있습니다.', sender: 'ai' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        console.error('API 응답 오류:', responseData);
      }

    } catch (error) {
      console.error('AI 응답 오류:', error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: '죄송합니다. AI 응답에 문제가 발생했습니다.', sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.sender === 'ai' && styles.aiMessageText]}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#999"
          editable={!loading}
        />
        <Button title="보내기" onPress={handleSendMessage} disabled={loading} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  aiMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
});
