import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Button, FlatList, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { 
  getExercises, getMeals, getUserInfo, 
  updateMealCalories, updateExerciseCalories 
} from '../../../src/db/database';
import { useFocusEffect } from 'expo-router';

// 🚨🚨🚨 이 부분은 반드시 서버가 실행되는 컴퓨터의 실제 IP 주소로 변경해야 합니다! 🚨🚨🚨
// 예시: "http://192.168.0.10:3000/api/chat"
const SERVER_URL = "http://172.30.1.78:3000/api/chat"; // ✅ 실제 서버 IP로 변경 필요

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  // ✅ recommendationGiven 상태를 Date 객체로 저장하여 날짜별로 리셋
  const [lastRecommendationDate, setLastRecommendationDate] = useState(null); 

  // AI 응답에서 JSON 형식의 영양 데이터를 추출하는 함수
  const extractNutritionData = (responseText) => {
    try {
      const exerciseMatch = responseText.match(/\{[\s\S]*"exerciseId":\s*\d+[\s\S]*\}/);
      const mealMatch = responseText.match(/\{[\s\S]*"fat":\s*\d+[\s\S]*\}/);

      let jsonString = null;
      if (exerciseMatch) {
        jsonString = exerciseMatch[0];
      } else if (mealMatch) {
        jsonString = mealMatch[0];
      } else {
        const codeBlockMatch = responseText.match(/```json([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        }
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

  // ✅ 데이터 불러오는 함수 - useCallback으로 메모이제이션
  const fetchUserData = useCallback(async (isInitialLoad = false) => {
    console.log("🔄 Fetching user data...", { isInitialLoad });
    try {
      const user = await getUserInfo();
      const exercisesData = await getExercises();
      const mealsData = await getMeals();
      setUserInfo(user);
      setExercises(exercisesData);
      setMeals(mealsData);
      console.log("✅ User Info loaded:", user ? user.goal : 'None');
      console.log("✅ Meals loaded:", mealsData.length);
      console.log("✅ Exercises loaded:", exercisesData.length);

      if (isInitialLoad) {
        // 첫 메시지는 한 번만 설정
        setMessages([
          { id: '1', text: '안녕하세요! 저는 당신의 건강 목표 달성을 도와줄 AI 코치입니다. 무엇이든 물어보세요!', sender: 'ai' },
        ]);
        // 초기 로드 시 자동 분석 및 추천 시작 (userInfo가 있어야 함)
        if (user) {
            handleAutoAnalyze(user, mealsData, exercisesData);
        } else {
            // 사용자 정보가 없으면 AI 분석 경고 메시지 표시
            setMessages(prev => [...prev, { id: 'warn-user-info', text: '⚠️ 사용자 정보가 없습니다. "내 정보" 탭에서 정보를 입력해주세요.', sender: 'ai' }]);
            Alert.alert("알림", "사용자 정보가 없어 AI 분석을 할 수 없습니다. '내 정보' 탭에서 정보를 입력해주세요.");
        }
      }
    } catch (error) {
      console.error("❌ 데이터 로드 오류:", error);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    }
  }, [lastRecommendationDate]); // ✅ lastRecommendationDate 의존성 추가

  // 컴포넌트 마운트 시 한 번 호출
  useEffect(() => { 
    fetchUserData(true); 
  }, []);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      // ✅ 포커스 될 때마다 데이터를 새로 불러오고, 필요한 경우 자동 분석을 다시 시도
      const loadAndAnalyze = async () => {
        const user = await getUserInfo(); // 최신 사용자 정보 가져오기
        const exercisesData = await getExercises();
        const mealsData = await getMeals();
        setUserInfo(user);
        setExercises(exercisesData);
        setMeals(mealsData);

        if (user) {
            handleAutoAnalyze(user, mealsData, exercisesData);
        } else {
            // 사용자 정보가 없으면 경고 메시지 표시 (이미 있으면 중복 방지)
            if (!messages.some(msg => msg.id === 'warn-user-info')) {
                setMessages(prev => [...prev, { id: 'warn-user-info', text: '⚠️ 사용자 정보가 없습니다. "내 정보" 탭에서 정보를 입력해주세요.', sender: 'ai' }]);
            }
        }
      };
      loadAndAnalyze();
    }, [fetchUserData, messages]) // fetchUserData와 messages 의존성 추가
  );

  // ✅ 오늘의 식단/운동 기록을 기반으로 AI가 자동 분석 및 추천을 하는 함수
  const handleAutoAnalyze = useCallback(async (user, currentMeals, currentExercises) => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD 형식
    
    // ✅ 오늘 이미 추천을 했다면 다시 하지 않음
    if (lastRecommendationDate === today) {
        console.log("ℹ️ Today's recommendation already given.");
        return; 
    }

    if (!user) {
        console.log("ℹ️ User info not available for auto-analyze.");
        return;
    }

    const todaysMeals = currentMeals.filter(m => m.date === today);
    const todaysExercises = currentExercises.filter(e => e.date === today);

    const uncalculatedMeals = todaysMeals.filter(m => m.calories === 0);
    const uncalculatedExercises = todaysExercises.filter(e => e.calories === 0);

    // 오늘 기록이 없거나 모두 분석되었다면 자동 추천 메시지 건너뛰기
    if (todaysMeals.length === 0 && todaysExercises.length === 0 && uncalculatedMeals.length === 0 && uncalculatedExercises.length === 0) {
        console.log("ℹ️ No records or all records analyzed for today. Skipping auto-analyze.");
        setLastRecommendationDate(today); // 오늘 기록이 없어도, 오늘 날짜로 저장해서 재실행 방지
        return;
    }

    const mealsSummary = todaysMeals.map(m => `(ID:${m.id}) ${m.food_name} ${m.quantity} (${m.calories || 0}kcal)`).join('; ');
    const exercisesSummary = todaysExercises.map(e => `(ID:${e.id}) ${e.type} ${e.duration || 0}분 (${e.calories || 0}kcal)`).join('; ');
    
    // AI 프롬프트 구성 (자동 분석 및 운동 추천 요청)
    const prompt = `
      당신은 사용자의 건강 목표 달성을 돕는 전문 AI 코치입니다.
      사용자 정보: 목표 몸무게(${user.target_weight}kg), 현재 몸무게(${user.weight}kg), 목표("${user.goal}").
      
      [오늘의 식단]: ${mealsSummary || '기록 없음'}
      [오늘의 운동]: ${exercisesSummary || '기록 없음'}
      [오늘의 미분석 식단]: ${uncalculatedMeals.map(m => `(ID:${m.id}) ${m.food_name} ${m.quantity}`).join('; ') || '없음'}
      [오늘의 미분석 운동]: ${uncalculatedExercises.map(e => `(ID:${e.id}) ${e.type} 세트:${e.sets || 0}, 반복:${e.reps || 0}, 무게:${e.weight || 0}kg`).join('; ') || '없음'}
      
      오늘 기록을 바탕으로 다음을 수행해주세요:
      1. '미분석 식단'이 존재하면, 가장 최근 1개에 대해 칼로리, 단백질, 탄수화물, 지방을 계산하고 JSON 형식으로 반환하세요. (quantity는 숫자 값으로 변환하여 칼로리 계산에 반영)
      2. '미분석 운동'이 존재하면, 가장 최근 1개에 대해 소모 칼로리를 계산하고 JSON 형식으로 반환하세요. (duration은 숫자 값으로 변환하여 칼로리 계산에 반영)
      3. 모든 계산 후, 사용자가 오늘 섭취한 총 칼로리(분석 완료된 식단+ 분석 미완료된 식단)와 소모한 총 칼로리(분석 완료된 운동) 를 고려하여 **추가 운동을 집에서 할 수 
      있는운동알려주고 추천한 운동을 얼마나해야 얼마만큼 칼로리가 소모되는지 구체적으로 추천**해주세요.
      4. 답변은 친절하고 전문적인 한국어 코치 톤으로 작성해주세요.
    `;

    setLoading(true);
    try {
      const aiResponse = await sendAIRequestToServer(prompt); // 서버에 요청
      if (aiResponse) {
        // 자동 분석 결과 메시지 추가 (메시지 배열의 마지막에 추가)
        setMessages(prev => [...prev, { id: `auto-ai-${Date.now()}`, text: aiResponse, sender: 'ai' }]);
        setLastRecommendationDate(today); // ✅ 오늘 날짜로 추천 완료 상태 저장
      }
    } catch (error) {
      console.error("❌ 자동 분석 및 추천 오류:", error);
      setMessages(prev => [...prev, { id: `auto-err-${Date.now()}`, text: '자동 분석 및 추천 중 오류가 발생했습니다.', sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  }, [meals, exercises, userInfo, lastRecommendationDate]); // ✅ 모든 관련 상태를 의존성 배열에 추가

  // ✅ AI 서버에 요청을 보내고 응답을 처리하는 공통 함수
  const sendAIRequestToServer = useCallback(async (prompt) => {
    if (!SERVER_URL || SERVER_URL === "http://YOUR_COMPUTER_IP:3000/api/chat") {
      Alert.alert("오류", "서버 주소를 설정해주세요. (예: http://192.168.1.10:3000/api/chat)");
      return null;
    }
    if (!userInfo) {
      // 이 경고는 handleAutoAnalyze나 handleSendMessage에서 이미 처리됨
      return null;
    }

    try {
      const requestBody = { model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] };
      const apiResponse = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const responseData = await apiResponse.json();
      let aiResponseText = 'AI 응답을 처리할 수 없습니다.';
      let nutritionData = null;

      if (apiResponse.ok && responseData.choices?.[0]?.message) {
        const raw = responseData.choices[0].message.content;
        nutritionData = extractNutritionData(raw);
        
        let cleanedText = raw.replace(/```json[\s\S]*```/g, '').trim();

        if (nutritionData) {
          if (nutritionData.mealId) {
            const meal = meals.find(m => m.id === nutritionData.mealId);
            // ✅ quantity를 숫자로 변환, 기본값 1
            const quantityValue = meal && !isNaN(parseFloat(meal.quantity)) ? parseFloat(meal.quantity) : 1;

            await updateMealCalories(
              nutritionData.mealId,
              Math.round((nutritionData.calories || 0) * quantityValue), // 반올림
              Math.round((nutritionData.protein || 0) * quantityValue),
              Math.round((nutritionData.carbs || 0) * quantityValue),
              Math.round((nutritionData.fat || 0) * quantityValue)
            );
            cleanedText += `\n\n✅ [AI 분석 완료] 식단 기록이 갱신되었습니다.`;
          } else if (nutritionData.exerciseId) {
            const exercise = exercises.find(e => e.id === nutritionData.exerciseId);
            // ✅ duration을 숫자로 변환, 기본값 1
            const durationValue = exercise && !isNaN(parseFloat(exercise.duration)) ? parseFloat(exercise.duration) : 1;

            await updateExerciseCalories(
              nutritionData.exerciseId,
              Math.round((nutritionData.calories || 0) * durationValue) // 반올림
            );
            cleanedText += `\n\n✅ [AI 분석 완료] 운동 기록이 갱신되었습니다.`;
          }
          fetchUserData(false); // DB 업데이트 후 데이터 새로고침 (자동 분석 트리거 안 함)
        }
        return cleanedText;

      } else {
        const errorMessage = responseData.error ? responseData.error.message : '알 수 없는 서버 응답 오류';
        console.error('❌ 서버 응답 오류 상세:', responseData);
        return `⚠️ 서버 요청 실패: ${errorMessage}`;
      }
    } catch (e) {
      console.error("❌ AI 요청 오류:", e);
      return '⚠️ 서버 연결에 실패했습니다. 서버가 실행 중인지, IP 주소가 맞는지 확인해주세요.';
    }
  }, [userInfo, meals, exercises, fetchUserData]); // ✅ 모든 관련 상태를 의존성 배열에 추가

  // ✅ 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || loading) return;

    // 사용자 메시지 추가
    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]); 
    setInputText('');
    setLoading(true);

    const dateObj = new Date();
    const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
    const todaysMeals = meals.filter(m => m.date === today);
    const todaysExercises = exercises.filter(e => e.date === today);

    const mealsSummary = todaysMeals.map(m => `(ID:${m.id}) ${m.food_name} ${m.quantity} (${m.calories || 0}kcal)`).join('; ');
    const exercisesSummary = todaysExercises.map(e => `(ID:${e.id}) ${e.type} ${e.duration || 0}분 (${e.calories || 0}kcal)`).join('; ');
    
    // AI 프롬프트 구성 (사용자 질문 기반)
    const userPrompt = `
      당신은 사용자의 건강 목표 달성을 돕는 전문 AI 코치입니다.
      사용자 정보: 목표 몸무게(${userInfo?.target_weight || 'N/A'}kg), 현재 몸무게(${userInfo?.weight || 'N/A'}kg), 목표("${userInfo?.goal || 'N/A'}").
      
      [오늘의 식단]: ${mealsSummary || '기록 없음'}
      [오늘의 운동]: ${exercisesSummary || '기록 없음'}
      
      사용자의 질문: "${userMessage.text}"
      
      이전 대화를 참고하여 답변하고, 필요하다면 오늘의 식단과 운동 기록을 분석하고 운동을 추천해주세요.
      답변은 친절하고 전문적인 한국어 코치 톤으로 작성해주세요.
      만약 칼로리 계산이 필요하면, JSON 형식으로도 반환하세요 (가이드라인 참고).
    `;

    // AI 서버에 요청 보내고 응답 받기
    const aiResponseText = await sendAIRequestToServer(userPrompt);
    if (aiResponseText) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' }]);
    }
    setLoading(false);
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
          <ActivityIndicator size="small" color="#007AFF"/>
          <Text style={styles.loadingText}>AI 코치가 분석 중입니다...</Text>
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="메시지를 입력하세요 (예: 오늘 식단 분석해줘)" 
          placeholderTextColor="#999"
          editable={!loading}
        />
        <Button title={loading ? "전송 중" : "보내기"} onPress={handleSendMessage} disabled={loading || inputText.trim() === ''} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  messageList: { paddingHorizontal: 10, paddingVertical: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  userMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderTopRightRadius: 5 },
  aiMessage: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start', borderTopLeftRadius: 5 }, // AI 메시지 버블 스타일
  messageText: { color: '#fff', fontSize: 16 },
  aiMessageText: { color: '#000' }, // AI 메시지 텍스트 색상
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, height: 40, marginRight: 10, color:'#000' },
  loadingContainer: { flexDirection:'row', alignItems:'center', padding:10, backgroundColor: '#e6f7ff', borderTopWidth: 1, borderTopColor: '#cceeff' },
  loadingText: { marginLeft:8, color:'#007AFF' }
});