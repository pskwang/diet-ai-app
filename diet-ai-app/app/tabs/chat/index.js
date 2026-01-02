import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Button, FlatList, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Linking, Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getExercises, getMeals, getUserInfo, 
  updateMealCalories, updateExerciseCalories 
} from '../../../src/db/database';
import { useFocusEffect } from 'expo-router';
import { initDatabase } from '../../../src/db/database';

const SERVER_URL = "http://10.191.107.204:3000/api/chat";

// 🔹 운동 리스트
const availableExercises = [
  "스쿼트","푸쉬업","푸시업","플랭크","런지","버피","덤벨 컬","벤치프레스","랫풀다운",
  "데드리프트","레그프레스","크런치","요가","러닝","런닝","조깅","싸이클링","줄넘기",
  "렉","산책","줄넘기"
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);

  const STORAGE_KEY = 'chatMessages';

  // 🔹 한국 시간 기준 오늘 날짜 계산
  const getKoreaToday = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const koreaTime = new Date(utc + 9 * 60 * 60000);
    return koreaTime.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // Hook 내에서 DB 초기화 + 데이터 로드
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();   // DB 초기화
        await fetchUserData();  // 데이터 불러오기
        await loadMessages();   // 메시지 불러오기
      } catch (error) {
        console.log('DB 초기화 또는 데이터 로드 실패:', error);
      }
    };
    setup();
  }, []);

  // ✅ 메시지 저장
  const saveMessages = async (msgs) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.log('메시지 저장 실패', error);
    }
  };

  // ✅ 메시지 불러오기
  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([
          { id: '1', text: '🏋️ 안녕하세요! AI 코치입니다. 오늘의 목표를 달성할 준비 되셨나요?', sender: 'ai' },
        ]);
      }
    } catch (error) {
      console.log('메시지 불러오기 실패', error);
    }
  };

  // 🔹 JSON 파싱
  const extractNutritionData = (responseText) => {
    try {
      const match = responseText.match(/\{[\s\S]*"calories"[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.log("❌ JSON 파싱 실패:", e);
    }
    return null;
  };

  // 🔹 데이터 로드
  const fetchUserData = useCallback(async () => {
    try {
      const user = await getUserInfo();
      const exercisesData = await getExercises();
      const mealsData = await getMeals();
      setUserInfo(user);
      setExercises(exercisesData);
      setMeals(mealsData);
    } catch (error) {
      Alert.alert("오류", "데이터 불러오기 실패");
    }
  }, []);

  useEffect(() => { 
    loadMessages();
    fetchUserData(); 
  }, []);

  useFocusEffect(useCallback(() => { fetchUserData(); }, [fetchUserData]));

  // 🔹 목표 달성도 계산
  const calculateGoalProgress = (userInfo, meals, exercises) => {
    if (!userInfo) return null;
    const today = getKoreaToday();
    const todaysMeals = meals.filter(m => m.date === today);
    const todaysExercises = exercises.filter(e => e.date === today);
    const totalIntake = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalBurn = todaysExercises.reduce((sum, e) => sum + (e.calories || 0), 0);
    const intakeGoal = userInfo.goal_intake || 1800;
    const burnGoal = userInfo.goal_burn || 500;

    return {
      totalIntake,
      totalBurn,
      intakeRate: Math.round(Math.min((totalIntake / intakeGoal) * 100, 100)),
      burnRate: Math.round(Math.min((totalBurn / burnGoal) * 100, 100))
    };
  };

  // 🔹 주간 리포트 계산 (한국 시간 기준)
  const calculateWeeklyReport = (meals, exercises) => {
    const today = new Date();
    let totalIntake = 0, totalBurn = 0, count = 0;

    const getKoreaDate = (date) => {
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const korea = new Date(utc + 9 * 60 * 60000);
      return korea.toISOString().slice(0, 10);
    };

    const calculateWeeklyReportUTC = (meals, exercises) => {
  const today = new Date();
  let totalIntake = 0, totalBurn = 0, count = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10); // ✅ UTC 기준 날짜
    const dayMeals = meals.filter(m => m.date === dateStr);
    const dayExercises = exercises.filter(e => e.date === dateStr);

    if (dayMeals.length || dayExercises.length) {
      count++;
      totalIntake += dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
      totalBurn += dayExercises.reduce((s, e) => s + (e.calories || 0), 0);
    }
  }

  const avgIntake = Math.round(totalIntake / count || 0);
  const avgBurn = Math.round(totalBurn / count || 0);
  return { avgIntake, avgBurn, days: count };
};


    const avgIntake = Math.round(totalIntake / count || 0);
    const avgBurn = Math.round(totalBurn / count || 0);
    return { avgIntake, avgBurn, days: count };
  };

  // 🔹 운동 영상 (선택적)
  const fetchRecommendedVideo = async (query) => {
    try {
      const response = await fetch(`${SERVER_URL.replace('/api/chat', '')}/api/video?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data?.url) {
        const videoMsg = {
          id: `video-${Date.now()}`,
          text: `🎥 ${data.title}`,
          thumbnail: data.thumbnail,
          url: data.url,
          sender: 'ai',
        };
        setMessages(prev => {
          const updated = [...prev, videoMsg];
          saveMessages(updated);
          return updated;
        });
      }
    } catch (error) {
      console.log("❌ 영상 요청 실패:", error);
    }
  };

  // 🔹 AI 요청
  const sendAIRequestToServer = useCallback(async (prompt) => {
    try {
      const body = { model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] };
      const res = await fetch(SERVER_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "응답 없음";
      let cleanedText = raw.replace(/```json[\s\S]*```/g, '').trim();

      const exerciseRegex = new RegExp(availableExercises.join("|"), "i");
      const matched = cleanedText.match(exerciseRegex);
      if (matched) await fetchRecommendedVideo(matched[0]);

      return cleanedText;
    } catch (e) {
      console.log("❌ AI 요청 실패:", e);
      return "⚠️ 서버 오류가 발생했습니다.";
    }
  }, []);

  // 🔹 메시지 전송
  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => { const updated = [...prev, userMsg]; saveMessages(updated); return updated; });
    setInputText('');
    setLoading(true);

    const today = getKoreaToday();
    const todaysMeals = meals.filter(m => m.date === today);
    const todayMealsText = todaysMeals.map(m => `• ${m.type}: ${m.food_name}`).join('\n');

    const goal = calculateGoalProgress(userInfo, meals, exercises);
    const weekly = calculateWeeklyReport(meals, exercises);

    let prompt = `
당신은 개인 맞춤형 건강 코치입니다.
사용자 목표: ${userInfo?.goal || 'N/A'}
오늘 섭취 칼로리와 영양소를 계산하세요.
오늘 먹은 음식:
${todayMealsText || '오늘 기록된 식단이 없습니다.'}

사용자 입력: "${inputText}"
`;

    if (/(식단|먹은 것|칼로리).*분석/.test(inputText)) {
      prompt += `
오늘의 식단 데이터를 기반으로 영양소(칼로리, 단백질, 탄수화물, 지방)를 분석하고,
부족하거나 과잉된 부분을 조언하세요.`;
    }

    if (inputText.includes("오늘")) {
      prompt += `
오늘 날짜(${today}) 기준으로 사용자의 식단과 운동 데이터를 분석하세요.
• 오늘 섭취 칼로리: ${goal?.totalIntake || 0} kcal
• 오늘 소모 칼로리: ${goal?.totalBurn || 0} kcal
• 오늘 식단 내역:
${todayMealsText || "- 기록 없음"}

오늘 데이터만을 기준으로 결과와 조언을 작성하세요.
`;
    }

    if (/(루틴|운동 계획)/.test(inputText)) {
      prompt += `
주간 운동 데이터를 고려해 다음 주에 적합한 루틴을 추천하세요.
(예: 유산소/무산소 균형, 근육 부위 분할 등)`;
    }

     if (/운동추천/.test(inputText)) {
  // 1️⃣ 랜덤 운동 텍스트 생성
  const homeExercises = [
   "스쿼트","푸쉬업","푸시업","플랭크","런지","버피","덤벨 컬","벤치프레스","랫풀다운",
  "데드리프트","레그프레스","크런치","요가","러닝","런닝","조깅","싸이클링","줄넘기",
  "렉","산책","줄넘기"
  ];
  const shuffled = homeExercises.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  prompt += `
🏡 집에서 할 수 있는 운동 추천: ${selected.join(", ")}`;

  // 2️⃣ 스트레칭 영상 추천
  try {
    const stretchQuery = "스트레칭";
    const response = await fetch(`${SERVER_URL.replace('/api/chat', '')}/api/video?query=${encodeURIComponent(stretchQuery)}`);
    const data = await response.json();
    if (data?.url) {
      const videoMsg = {
        id: `video-${Date.now()}`,
        text: `🧘 스트레칭 영상: ${data.title}`,
        thumbnail: data.thumbnail,
        url: data.url,
        sender: 'ai',
      };
      setMessages(prev => {
        const updated = [...prev, videoMsg];
        saveMessages(updated);
        return updated;
      });
    }
  } catch (error) {
    console.log("❌ 스트레칭 영상 요청 실패:", error);
  }
}


    if (/(리포트|주간|분석)/.test(inputText)) {
      prompt += `
최근 7일 데이터를 요약해 리포트를 작성하세요.
"이번 주 섭취량은 목표 대비 몇 %였는지", "운동이 부족한지" 등 분석하세요.`;
    }

    const aiText = await sendAIRequestToServer(prompt);
    setMessages(prev => { const updated = [...prev, { id: (Date.now() + 1).toString(), text: aiText, sender: 'ai' }]; saveMessages(updated); return updated; });
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
      <Text style={[styles.msgText, item.sender === 'ai' && styles.aiText]}>{item.text}</Text>
      {item.thumbnail && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
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
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#007AFF"/>
          <Text style={styles.loadingText}>AI 코치가 분석 중...</Text>
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputBox}>
        <TextInput 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="메시지를 입력하세요 (예: 주간 리포트 보여줘)"
          placeholderTextColor="#999"
        />
        <Button title="보내기" onPress={handleSendMessage} disabled={loading}/>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  messageList: { padding: 15 },
  messageBubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '85%' },
  userMsg: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderTopRightRadius: 5 },
  aiMsg: { backgroundColor: '#e6e6e6', alignSelf: 'flex-start', borderTopLeftRadius: 5 },
  msgText: { color: '#fff', fontSize: 15 },
  aiText: { color: '#000' },
  inputBox: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, height: 40, marginRight: 10, color:'#000' },
  loadingBox: { flexDirection:'row', alignItems:'center', padding:10, backgroundColor:'#e8f5ff', borderTopWidth:1, borderTopColor:'#cceeff' },
  loadingText: { marginLeft:8, color:'#007AFF' },
  thumbnail: { width: 240, height: 135, borderRadius: 10, marginTop: 8 },
});
