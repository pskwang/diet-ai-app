const express = require('express');
const cors = require('cors');
const axios = require('axios'); // ✅ YouTube API 호출용
require('dotenv').config(); // .env 파일에서 환경 변수를 불러옵니다.

const app = express();
const port = 3000; // 서버가 실행될 포트

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// ✅ .env 파일에서 API 키를 안전하게 불러옵니다.
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // ✅ 추가됨
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

if (!CHATGPT_API_KEY) {
  console.error("🚨 .env 파일에 CHATGPT_API_KEY가 설정되지 않았습니다!");
}
if (!YOUTUBE_API_KEY) {
  console.error("🚨 .env 파일에 YOUTUBE_API_KEY가 설정되지 않았습니다!");
}

// ✅ ChatGPT와의 통신 엔드포인트
// ✅ ChatGPT와의 통신 엔드포인트 (프롬프트 조립 로직 포함)
app.post('/api/chat', async (req, res) => {
  if (!CHATGPT_API_KEY) {
    return res.status(500).json({ error: { message: "서버에 API 키가 설정되지 않았습니다." } });
  }

  const { inputText, userInfo, todaysMeals, goal, weekly } = req.body;

  if (!inputText) {
    return res.status(400).json({ error: { message: "inputText가 필요합니다." } });
  }

  // 🔹 운동 리스트
  const availableExercises = [
    "스쿼트","푸쉬업","푸시업","플랭크","런지","버피","덤벨 컬","벤치프레스","랫풀다운",
    "데드리프트","레그프레스","크런치","요가","러닝","런닝","조깅","싸이클링","줄넘기",
    "렉","산책"
  ];

  const todayMealsText = (todaysMeals || [])
    .map(m => `• ${m.type}: ${m.food_name}`)
    .join('\n');

  // 🔹 프롬프트 조립
  let prompt = `
당신은 개인 맞춤형 건강 코치입니다.
사용자 목표: ${userInfo?.goal || 'N/A'}
오늘 섭취 칼로리와 영양소를 계산하세요.
오늘 먹은 음식:
${todayMealsText || '오늘 기록된 식단이 없습니다.'}

사용자 입력: "${inputText}"
`;

  if (/(식단|먹은 것|칼로리).*분석/.test(inputText)) {
    prompt += `\n오늘의 식단 데이터를 기반으로 영양소(칼로리, 단백질, 탄수화물, 지방)를 분석하고, 부족하거나 과잉된 부분을 조언하세요.`;
  }

  if (inputText.includes("오늘")) {
    prompt += `
오늘 사용자의 식단과 운동 데이터를 분석하세요.
- 오늘 섭취 칼로리: ${goal?.totalIntake || 0} kcal
- 오늘 소모 칼로리: ${goal?.totalBurn || 0} kcal
오늘 데이터만을 기준으로 결과와 조언을 작성하세요.`;
  }

  if (/(루틴|운동 계획)/.test(inputText)) {
    prompt += `\n주간 운동 데이터를 고려해 다음 주에 적합한 루틴을 추천하세요.`;
  }

  let recommendedExercises = null;
  if (/운동추천/.test(inputText)) {
    const shuffled = [...availableExercises].sort(() => 0.5 - Math.random());
    recommendedExercises = shuffled.slice(0, 5);
    prompt += `\n🏡 집에서 할 수 있는 운동 추천: ${recommendedExercises.join(", ")}`;
  }

  if (/(리포트|주간|분석)/.test(inputText)) {
    prompt += `\n최근 7일 데이터(평균 섭취 ${weekly?.avgIntake || 0}kcal, 평균 소모 ${weekly?.avgBurn || 0}kcal)를 요약해 리포트를 작성하세요.`;
  }

  try {
    const aiResponse = await fetch(CHATGPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      }),
    });
    const responseData = await aiResponse.json();
    const raw = responseData.choices?.[0]?.message?.content || "응답 없음";

    // 🔹 응답 정리
    const cleanedText = raw.replace(/```json[\s\S]*```/g, '').trim();

    // 🔹 운동 언급 감지
    const exerciseRegex = new RegExp(availableExercises.join("|"), "i");
    const matched = cleanedText.match(exerciseRegex);

    res.json({
      text: cleanedText,
      matchedExercise: matched ? matched[0] : null,
      recommendedExercises,
    });
  } catch (error) {
    console.error("ChatGPT API 호출 중 오류:", error);
    res.status(500).json({ error: { message: "AI 서버와의 통신에 실패했습니다." } });
  }
});


// ✅ YouTube 영상 검색 엔드포인트 추가
app.get('/api/video', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'query 파라미터가 필요합니다.' });
  }

  try {
    // YouTube 검색 요청
    const ytResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: `${query} 운동`,
        type: 'video',
        maxResults: 1,
      },
    });

    const video = ytResponse.data.items?.[0];
    if (!video) return res.json({ url: null });

    const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
    const thumbnail = video.snippet.thumbnails?.high?.url;
    const title = video.snippet.title;

    // ✅ 영상 링크 + 제목 + 썸네일 함께 전송
    return res.json({ url, title, thumbnail });
  } catch (error) {
    console.error('❌ YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'YouTube 검색 실패' });
  }
});


const HOST = '0.0.0.0'; // 모든 네트워크 인터페이스 허용

app.listen(port, HOST, () => {
  console.log(`✅ 서버가 http://${HOST}:${port} (모든 네트워크) 에서 실행 중입니다.`);
});
