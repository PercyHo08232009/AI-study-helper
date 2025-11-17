require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 ADD THIS BLOCK RIGHT HERE (TOP OF FILE, BEFORE ROUTES)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // Stop preflight error
  }
  next();
});
// 🔥 END OF CORS FIX


const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
if (!OPENROUTER_KEY) {
  console.warn('Warning: OPENROUTER_KEY is not set in .env');
}

// Example route: the extension posts { model, messages, max_tokens }
app.post('/openrouter', async (req, res) => {
  try {
    // Expect body like: { model, messages, max_tokens }
    const body = req.body;

    // Build OpenRouter-compatible request.
    // OpenRouter's chat completions endpoint expects: model & messages (like OpenAI)
    const orBody = {
      model: body.model || 'openai/gpt-oss-20b:free', // choose a model that OpenRouter supports
      messages: body.messages || [],
      max_tokens: body.max_tokens || 600
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      },
      body: JSON.stringify(orBody)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OpenRouter proxy listening at http://localhost:${port}`));

