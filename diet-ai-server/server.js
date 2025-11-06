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
app.post('/api/chat', async (req, res) => {
  const requestBody = req.body;

  if (!CHATGPT_API_KEY) {
    return res.status(500).json({ error: { message: "서버에 API 키가 설정되지 않았습니다." } });
  }

  try {
    const aiResponse = await fetch(CHATGPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATGPT_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await aiResponse.json();
    res.json(responseData);
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
