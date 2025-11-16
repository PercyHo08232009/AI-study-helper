// popup.js
const summarizeBtn = document.getElementById('summarizeBtn');
const questionsBtn = document.getElementById('questionsBtn');
const flashcardsBtn = document.getElementById('flashcardsBtn');
const vocabBtn = document.getElementById('vocabBtn');
const output = document.getElementById('output');
const status = document.getElementById('status');
const apiModeSelect = document.getElementById('apiModeSelect');

const PROXY_URL = "http://localhost:3000/openrouter"; // proxy route that will call OpenRouter

function setStatus(s) {
  status.innerText = s;
}

async function getPageTextFromActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return resolve('');
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get_page_text' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(''); // no content script or permission error
        } else {
          resolve(response.text || '');
        }
      });
    });
  });
}

// Call proxy which forwards to OpenRouter
async function callProxy(payload) {
  const res = await fetch("http://localhost:3000/openrouter", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error: ${res.status} ${text}`);
  }
  return await res.json();
}

// Direct call (DEVELOPMENT ONLY) - NOT RECOMMENDED
async function callOpenRouterDirect(payload) {
  // This would require a direct OpenRouter key in the frontend (unsafe).
  // We leave this as a stub to discourage use.
  throw new Error("Direct mode is disabled for security. Use proxy mode.");
}

async function aiRequest(prompt) {
  setStatus('Processing...');
  output.innerText = '...';

  const payload = {
    model: 'nvidia/nemotron-nano-9b-v2:free', // placeholder — proxy will reformat for OpenRouter; or choose a model supported by OpenRouter
    messages: [
      { role: 'system', content: 'You are a concise helpful assistant that summarizes text or generates study materials.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 600
  };

  try {
    const modeSelected = apiModeSelect.value;
    let data;
    if (modeSelected === 'proxy') {
      data = await callProxy(payload);
    } else {
      data = await callOpenRouterDirect(payload);
    }

    // For OpenRouter-like responses the text may be at data.choices[0].message.content
    const choiceText = data?.choices?.[0]?.message?.content ?? data?.result ?? JSON.stringify(data, null, 2);
    setStatus('Done');
    output.innerText = choiceText;
  } catch (err) {
    setStatus('Error');
    output.innerText = 'Error: ' + String(err);
    console.error(err);
  }
}

async function handleSummarize() {
  setStatus('Getting page text...');
  const pageText = await getPageTextFromActiveTab();
  if (!pageText || pageText.length < 20) {
    output.innerText = 'No text found on this page (try selecting text or open an article).';
    return;
  }
  const prompt = `Summarize this text into a short concise summary (3-6 sentences):\n\n${pageText}`;
  await aiRequest(prompt);
}

async function handleQuestions() {
  setStatus('Getting page text...');
  const pageText = await getPageTextFromActiveTab();
  if (!pageText || pageText.length < 20) {
    output.innerText = 'No text found on this page.';
    return;
  }
  const prompt = `Create 6 comprehension questions (with short answers) from this text. Format as "Q1: ...\\nA1: ..." :\n\n${pageText}`;
  await aiRequest(prompt);
}

async function handleFlashcards() {
  setStatus('Getting page text...');
  const pageText = await getPageTextFromActiveTab();
  if (!pageText || pageText.length < 20) {
    output.innerText = 'No text found on this page.';
    return;
  }
  const prompt = `Create flashcards in the format "Term: ...\\nDefinition: ..." from this text. Produce 8 flashcards focusing on key terms and short definitions:\n\n${pageText}`;
  await aiRequest(prompt);
}

async function handleVocab() {
  setStatus('Getting page text...');
  const pageText = await getPageTextFromActiveTab();
  if (!pageText || pageText.length < 20) {
    output.innerText = 'No text found on this page.';
    return;
  }
  const prompt = `Extract the top 10 vocabulary words from this text and give a simple one-sentence definition for each:\n\n${pageText}`;
  await aiRequest(prompt);
}

summarizeBtn.addEventListener('click', handleSummarize);
questionsBtn.addEventListener('click', handleQuestions);
flashcardsBtn.addEventListener('click', handleFlashcards);
vocabBtn.addEventListener('click', handleVocab);
