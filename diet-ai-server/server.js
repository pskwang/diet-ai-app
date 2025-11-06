const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env 파일에서 환경 변수를 불러옵니다.

const app = express();
const port = 3000; // 서버가 실행될 포트

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// .env 파일에서 API 키를 안전하게 불러옵니다.
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

if (!CHATGPT_API_KEY) {
    console.error("🚨 .env 파일에 CHATGPT_API_KEY가 설정되지 않았습니다!");
}

// '/api/chat' 경로로 POST 요청이 오면 처리합니다.
app.post('/api/chat', async (req, res) => {
    const requestBody = req.body; // 앱에서 보낸 요청 본문을 그대로 받습니다.

    if (!CHATGPT_API_KEY) {
        return res.status(500).json({ error: { message: "서버에 API 키가 설정되지 않았습니다." } });
    }
    
    try {
        // 서버가 ChatGPT API를 호출합니다.
        const aiResponse = await fetch(CHATGPT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHATGPT_API_KEY}`, // API 키는 서버에서만 사용됩니다.
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await aiResponse.json();
        
        // ChatGPT의 응답을 다시 앱으로 전달합니다.
        res.json(responseData); 

    } catch (error) {
        console.error("ChatGPT API 호출 중 오류:", error);
        res.status(500).json({ error: { message: "AI 서버와의 통신에 실패했습니다." } });
    }
});

const HOST = '0.0.0.0'; // 모든 네트워크 인터페이스 허용

app.listen(port, HOST, () => {
    console.log(`✅ 서버가 http://${HOST}:${port} (모든 네트워크) 에서 실행 중입니다.`);
});
