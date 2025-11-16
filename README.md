# AI-study-helper
Help study
OpenRouter Proxy Client

This project provides a local OpenRouter proxy that listens on http://localhost:3000 and allows you to send requests to OpenRouter models through a local endpoint. It is useful when working with browser extensions, apps, or tools that cannot directly call OpenRouter APIs.

🚀 Features

Local proxy server running on Node.js + Express

Forwards requests from localhost:3000 → OpenRouter

Simplifies API calls for extensions or frontend apps

Easy to modify or extend

📦 Installation
1. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

2. Install dependencies
npm install

3. Create a .env file

Inside the project folder:

OPENROUTER_API_KEY=your_api_key_here
PORT=3000

▶️ Running the Proxy

Start the server:

node server.js


If everything works, you should see:

OpenRouter proxy listening at http://localhost:3000

🔧 How to Use It

Send a POST request to the proxy:

Request

POST http://localhost:3000/v1/chat/completions
Content-Type: application/json


Body

{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}


Your proxy will forward this to OpenRouter.

❗ Common Errors
❌ fail to fetch

This usually means:

Your proxy is not running

You used http://127.0.0.1
 instead of http://localhost

Your browser extension is blocking requests

CORS is not allowed (add CORS middleware)

❌ CORS error fix

Add this at the top of server.js:

const cors = require("cors");
app.use(cors());

📜 License

MIT
