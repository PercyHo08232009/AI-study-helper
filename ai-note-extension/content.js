// Content script: extracts text from the page in a robust way
function extractArticleText() {
  try {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 50) return selection;

    const article = document.querySelector('article');
    if (article && article.innerText.trim().length > 200) return article.innerText.trim();

    const main = document.querySelector('main');
    if (main && main.innerText.trim().length > 200) return main.innerText.trim();

    const paragraphs = Array.from(document.querySelectorAll('p'));
    let text = paragraphs.map(p => p.innerText).join('\n\n');
    if (text.trim().length > 100) return text.trim();

    return document.body.innerText.trim();
  } catch (e) {
    return document.body.innerText.trim();
  }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req && req.action === 'get_page_text') {
    const extracted = extractArticleText();
    sendResponse({ text: extracted });
  }
});
