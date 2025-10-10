import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { getExercises, getMeals, getUserInfo, updateMealCalories, updateExerciseCalories } from '../../../src/db/database';
import { useFocusEffect } from 'expo-router';

const CHATGPT_API_KEY = "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"; 
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);

  // AI 응답에서 JSON 형식의 데이터를 추출하는 함수 (식단 및 운동 모두 처리)
  const extractNutritionData = (responseText) => {
    try {
      // 식단 또는 운동 ID를 포함하는 JSON 객체를 찾습니다.
      const jsonMatch = responseText.match(/\{[\s\S]*"fat":\s*\d+\s*\}/) || responseText.match(/\{[\s\S]*"exerciseId":\s*\d+\s*\}/); 
      if (jsonMatch) {
        const jsonString = jsonMatch[0].replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonString);
        
        if ((data.mealId || data.exerciseId) && typeof data.calories !== 'undefined') {
          return data;
        }
      }
    } catch (e) {
      console.log("JSON 파싱 실패:", e);
    }
    return null;
  };

  const fetchUserData = useCallback(async (isInitialLoad = false) => {
    try {
      const user = await getUserInfo();
      const exercisesData = await getExercises();
      const mealsData = await getMeals();
      setUserInfo(user);
      setExercises(exercisesData);
      setMeals(mealsData);

      if (isInitialLoad) {
        setMessages([
          { id: '1', text: '안녕하세요! 저는 당신의 건강 목표 달성을 도와줄 AI 코치입니다. 무엇이든 물어보세요!', sender: 'ai' },
        ]);
      }
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    }
  }, []);

  useEffect(() => {
    fetchUserData(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || loading) return;

    if (!CHATGPT_API_KEY || CHATGPT_API_KEY === "YOUR_API_KEY_HERE") {
         Alert.alert("오류", "API 키를 입력하지 않았습니다. CHATGPT_API_KEY를 설정해주세요.");
         return;
    }
    if (!userInfo) {
         Alert.alert("알림", "사용자 정보가 없어 AI 분석을 할 수 없습니다.");
         return;
    }

    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const dateObj = new Date();
      const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      const uncalculatedMeals = meals.filter(m => m.date === today && m.calories === 0);
      const uncalculatedExercises = exercises.filter(e => e.date === today && e.calories === 0);

      const mealsSummary = uncalculatedMeals.map(m => `(Meal ID:${m.id}, ${m.type}: ${m.food_name} ${m.quantity})`).join('; ');
      const exercisesSummary = uncalculatedExercises.map(e => `(Exercise ID:${e.id}, ${e.type}: 세트:${e.sets}, 반복:${e.reps}, 무게:${e.weight})`).join('; ');

      const userDataForAI = {
        user_info: userInfo,
        uncalculated_meals_summary: mealsSummary || '없음',
        uncalculated_exercises_summary: exercisesSummary || '없음',
        user_query: userMessage.text
      };

      const prompt = `
        당신은 사용자의 건강 목표 달성을 돕는 전문 AI 코치입니다.
        사용자의 목표 몸무게는 ${userInfo.target_weight}kg, 현재 몸무게는 ${userInfo.weight}kg, 주요 목표는 "${userInfo.goal}"입니다.
        
        [오늘의 미분석 식단]: ${userDataForAI.uncalculated_meals_summary}
        [오늘의 미분석 운동]: ${userDataForAI.uncalculated_exercises_summary}
        
        사용자의 질문: "${userDataForAI.user_query}"
        
        [AI 기능 가이드라인]
        1. '미분석 식단' 또는 '미분석 운동'이 존재하면, AI는 가장 최근 기록 1개에 대해 **칼로리 및 영양 성분을 계산**해야 합니다.
        2. 계산 결과는 답변 텍스트와 함께, **반드시 다음의 JSON 형식 중 하나로만 반환**해야 합니다. (JSON은 답변 텍스트 뒤에 별도로 붙여주세요.)
           - 식단 업데이트: { "mealId": (ID), "calories": (kcal), "protein": (g), "carbs": (g), "fat": (g) }
           - 운동 업데이트: { "exerciseId": (ID), "calories": (kcal) }
        3. 답변 텍스트는 계산된 영양 정보를 기반으로 친절하고 전문적인 코치처럼 한국어로 작성해주세요.
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
      let aiResponseText = '죄송합니다. API 응답을 처리할 수 없습니다.';
      let nutritionData = null;

      if (aiResponse.ok && responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        let rawResponse = responseData.choices[0].message.content;
        
        nutritionData = extractNutritionData(rawResponse);
        
        if (nutritionData) {
            if (nutritionData.mealId) {
                await updateMealCalories(
                    nutritionData.mealId, 
                    nutritionData.calories || 0,
                    nutritionData.protein || 0,
                    nutritionData.carbs || 0,
                    nutritionData.fat || 0
                );
                aiResponseText = rawResponse.replace(/\{[\s\S]*"fat":\s*\d+\s*\}/, '').trim(); 
                aiResponseText = aiResponseText.replace(/```json[\s\S]*```/, '').trim(); 
                aiResponseText += `\n\n✅ [AI 분석 완료] 식단 ID ${nutritionData.mealId}의 칼로리가 저장되었습니다.`;
            } else if (nutritionData.exerciseId) {
                // 🚨 운동 칼로리 업데이트
                await updateExerciseCalories(
                    nutritionData.exerciseId, 
                    nutritionData.calories || 0
                );
                aiResponseText = rawResponse.replace(/\{[\s\S]*"calories":\s*\d+\s*\}/, '').trim(); 
                aiResponseText = aiResponseText.replace(/```json[\s\S]*```/, '').trim(); 
                aiResponseText += `\n\n✅ [AI 분석 완료] 운동 ID ${nutritionData.exerciseId}의 칼로리가 저장되었습니다.`;
            }
            fetchUserData();

        } else {
            aiResponseText = rawResponse.replace(/```json[\s\S]*```/, '').trim(); 
        }
        
      } else {
        const errorMessage = responseData.error ? responseData.error.message : '알 수 없는 API 응답 오류';
        const errorMsgForUser = { id: (Date.now() + 1).toString(), text: `⚠️ API 요청 실패: ${errorMessage}`, sender: 'ai' };
        setMessages(prevMessages => [...prevMessages, errorMsgForUser]);
        console.error('API 응답 오류 상세:', responseData);
      }

      const aiMessage = { id: (Date.now() + 1).toString(), text: aiResponseText.trim(), sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      fetchUserData(); 

    } catch (error) {
      console.error('네트워크 또는 처리 중 오류:', error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: '죄송합니다. 네트워크 요청에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.', sender: 'ai' };
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
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>AI 코치가 답변을 생성 중입니다...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요 (예: 오늘 식단 분석해줘)"
          placeholderTextColor="#999"
          editable={!loading}
        />
        <Button 
          title={loading ? "전송 중" : "보내기"} 
          onPress={handleSendMessage} 
          disabled={loading || inputText.trim() === ''} 
        />
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
    borderRadius: 15,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderTopRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#e6f7ff',
    borderTopWidth: 1,
    borderTopColor: '#cceeff',
  },
  loadingText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
  }
});