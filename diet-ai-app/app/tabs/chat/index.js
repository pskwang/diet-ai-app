import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Button, FlatList, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Linking, Image, TouchableOpacity
} from 'react-native';
import { 
  getExercises, getMeals, getUserInfo, 
  updateMealCalories, updateExerciseCalories 
} from '../../../src/db/database';
import { useFocusEffect } from 'expo-router';

const SERVER_URL = "http://172.30.1.78:3000/api/chat";

// 🔹 평소 집에서 할 수 있는 운동 리스트
const availableExercises = [
  "스쿼트", "푸쉬업", "플랭크", "런지", "버피", "덤벨 컬", "벤치프레스", "랫풀다운",
  "데드리프트", "사이드 레터럴 레이즈", "레그프레스", "암컬", "트라이셉스 익스텐션",
  "크런치", "레그 레이즈", "플랭크 트위스트", "힙 브리지", "숄더 프레스", "케틀벨 스윙",
  "스트레칭", "요가", "카프 스트레칭", "햄스트링 스트레칭", "어깨 스트레칭",
  "러닝", "조깅", "싸이클링", "점핑잭", "하이니즈", "마운틴 클라이머", "로잉머신", "줄넘기", "스텝퍼", "에어로빅"
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);

  const extractNutritionData = (responseText) => {
    try {
      const exerciseMatch = responseText.match(/\{[\s\S]*"exerciseId":\s*\d+[\s\S]*\}/);
      const mealMatch = responseText.match(/\{[\s\S]*"fat":\s*\d+[\s\S]*\}/);
      let jsonString = null;
      if (exerciseMatch) jsonString = exerciseMatch[0];
      else if (mealMatch) jsonString = mealMatch[0];
      else {
        const codeBlockMatch = responseText.match(/```json([\s\S]*?)```/);
        if (codeBlockMatch) jsonString = codeBlockMatch[1];
      }
      if (jsonString) {
        const data = JSON.parse(jsonString.replace(/```json|```/g, '').trim());
        if ((data.mealId || data.exerciseId) && typeof data.calories !== 'undefined') {
          return data;
        }
      }
    } catch (e) {
      console.log("❌ JSON 파싱 실패:", e);
    }
    return null;
  };

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getUserInfo();
      const exercisesData = await getExercises();
      const mealsData = await getMeals();
      setUserInfo(user);
      setExercises(exercisesData);
      setMeals(mealsData);

      if (messages.length === 0) {
        setMessages([
          { id: '1', text: '안녕하세요! 저는 당신의 건강 목표 달성을 도와줄 AI 코치입니다. 무엇이든 물어보세요!', sender: 'ai' },
        ]);
      }
    } catch (error) {
      console.error("❌ 데이터 로드 오류:", error);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    }
  }, [messages]);

  useEffect(() => { fetchUserData(); }, []);
  useFocusEffect(useCallback(() => { fetchUserData(); }, [fetchUserData]));

  const fetchRecommendedVideo = async (query) => {
    try {
      const response = await fetch(`${SERVER_URL.replace('/api/chat', '')}/api/video?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data?.url) {
        setMessages(prev => [
          ...prev,
          {
            id: `video-${Date.now()}`,
            text: `🎥 ${data.title}`,
            thumbnail: data.thumbnail,
            url: data.url,
            sender: 'ai',
          },
        ]);
      }
    } catch (error) {
      console.error("❌ 영상 요청 실패:", error);
    }
  };

  const sendAIRequestToServer = useCallback(async (prompt) => {
    if (!SERVER_URL) { Alert.alert("오류", "서버 주소를 설정해주세요."); return null; }
    if (!userInfo) return null;

    try {
      const requestBody = { model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] };
      const apiResponse = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const responseData = await apiResponse.json();
      let nutritionData = null;
      if (apiResponse.ok && responseData.choices?.[0]?.message) {
        const raw = responseData.choices[0].message.content;
        nutritionData = extractNutritionData(raw);
        let cleanedText = raw.replace(/```json[\s\S]*```/g, '').trim();

        // 🔹 운동명 추출
        const exerciseRegex = new RegExp(availableExercises.join("|"), "i");
        const matchedExercise = cleanedText.match(exerciseRegex);
        if (matchedExercise) {
          fetchRecommendedVideo(matchedExercise[0]);
        } else {
          // 🔹 운동명이 없으면 랜덤 추천
          const shuffled = availableExercises.sort(() => 0.5 - Math.random());
          const recommended = shuffled.slice(0, 5).join(", ");
          cleanedText += `\n\n🏠 집에서 할 수 있는 운동 추천: ${recommended}`;
        }

        // ✅ DB 업데이트
        if (nutritionData) {
          if (nutritionData.mealId) {
            const meal = meals.find(m => m.id === nutritionData.mealId);
            const q = meal && !isNaN(parseFloat(meal.quantity)) ? parseFloat(meal.quantity) : 1;
            await updateMealCalories(
              nutritionData.mealId,
              Math.round((nutritionData.calories || 0) * q),
              Math.round((nutritionData.protein || 0) * q),
              Math.round((nutritionData.carbs || 0) * q),
              Math.round((nutritionData.fat || 0) * q)
            );
            cleanedText += `\n\n✅ [AI 분석 완료] 식단 기록이 갱신되었습니다.`;
          } else if (nutritionData.exerciseId) {
            const exercise = exercises.find(e => e.id === nutritionData.exerciseId);
            const d = exercise && !isNaN(parseFloat(exercise.duration)) ? parseFloat(exercise.duration) : 1;
            await updateExerciseCalories(
              nutritionData.exerciseId,
              Math.round((nutritionData.calories || 0) * d)
            );
            cleanedText += `\n\n✅ [AI 분석 완료] 운동 기록이 갱신되었습니다.`;
          }
          fetchUserData();
        }
        return cleanedText;
      }
    } catch (e) {
      console.error("❌ AI 요청 오류:", e);
      return '⚠️ 서버 연결 실패. 서버 실행 중인지 확인하세요.';
    }
  }, [userInfo, meals, exercises, fetchUserData]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || loading) return;
    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);
    const todaysMeals = meals.filter(m => m.date === today);
    const todaysExercises = exercises.filter(e => e.date === today);

    const mealsSummary = todaysMeals.map(m => `${m.food_name} ${m.quantity || 1}인분`).join(', ');
    const exercisesSummary = todaysExercises.map(e => `${e.type} ${e.duration || 0}분`).join(', ');

    const isMealAnalysisRequest = /(식단|먹은것|칼로리).*분석/.test(userMessage.text);

    let prompt = `
      당신은 사용자의 건강 목표 달성을 돕는 전문 AI 코치입니다.
      사용자 목표: ${userInfo?.goal || 'N/A'}
      오늘의 식단: ${mealsSummary || '기록 없음'}
      오늘의 운동: ${exercisesSummary || '기록 없음'}
      사용자의 질문: "${userMessage.text}"
    `;

    if (isMealAnalysisRequest && todaysMeals.length > 0) {
      prompt += `
      위 식단 데이터를 기반으로 음식별 칼로리, 단백질, 탄수화물, 지방을 예측하고,
      총 섭취 칼로리를 계산하세요.
      각 음식에 대한 추정치와 총합을 표 형식 또는 리스트로 표시하세요.
      `;
    }

    const aiResponseText = await sendAIRequestToServer(prompt);
    if (aiResponseText) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' }]);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.sender === 'ai' && styles.aiMessageText]}>{item.text}</Text>
      {item.thumbnail && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 240, height: 135, borderRadius: 10, marginTop: 8 }}
          />
        </TouchableOpacity>
      )}
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
          <ActivityIndicator size="small" color="#007AFF"/>
          <Text style={styles.loadingText}>AI 코치가 분석 중입니다...</Text>
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="메시지를 입력하세요 (예: 오늘 먹은 식단 분석해줘)" 
          placeholderTextColor="#999"
          editable={!loading}
        />
        <Button title="보내기" onPress={handleSendMessage} disabled={loading}/>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  messageList: { paddingHorizontal: 10, paddingVertical: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  userMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderTopRightRadius: 5 },
  aiMessage: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start', borderTopLeftRadius: 5 },
  messageText: { color: '#fff', fontSize: 16 },
  aiMessageText: { color: '#000' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, height: 40, marginRight: 10, color:'#000' },
  loadingContainer: { flexDirection:'row', alignItems:'center', padding:10, backgroundColor: '#e6f7ff', borderTopWidth: 1, borderTopColor: '#cceeff' },
  loadingText: { marginLeft:8, color:'#007AFF' },
});
