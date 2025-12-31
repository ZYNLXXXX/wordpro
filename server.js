// 简单的 Node 后端：既托管静态页面，又代理转发到 Kimi API，解决浏览器直接请求的 CORS 问题

import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 为避免和可能存在的 python 简易服务器端口冲突，这里改用 8001
const PORT = process.env.PORT || 8001;

// 允许前端同源访问
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 静态文件托管（当前目录）
app.use(express.static(__dirname));

// 从环境变量读取 Kimi Key（推荐），否则用前端传的
const ENV_KIMI_KEY = process.env.KIMI_API_KEY || '';

// 代理路由：前端请求 /api/kimi，后端再去请求 moonshot
app.post('/api/kimi', async (req, res) => {
  try {
    const { payload, apiKey } = req.body || {};
    const keyToUse = ENV_KIMI_KEY || apiKey;
    if (!keyToUse) {
      return res.status(400).json({ error: 'Missing Kimi API key' });
    }

    const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToUse}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }
    res.json(data);
  } catch (e) {
    console.error('调用 Kimi API 失败:', e);
    res.status(500).json({ error: 'Kimi proxy error', detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`WordPro server running at http://localhost:${PORT}`);
});


