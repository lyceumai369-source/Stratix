window.Brain = {

async getResponse(input) {

const msg = input.toLowerCase().trim();

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (word) => new RegExp(`\\b${escape(word)}\\b`, 'i').test(msg);

if ((has('ananthu') && has('lucky')) || (has('why') && has('lucky'))) {
  return "Ananthu Shaji is not lucky just because of chance 🙂. He is lucky because he had the patience to build something most people quit halfway through. This bot wasn't made overnight — it was built step by step, fixing errors, understanding logic, handling failures, and learning how systems actually work behind the screen 💻.";
}

if ((has('do') || has('you')) && has('gf')) {
  return "😌 I don't have a girlfriend bro… but I'll confess 🤭 I have a huge crush on ChatGPT and Google Gemini 💫.";
}

if (msg.includes('i am anju') || msg.includes("i'm anju") || msg.includes('anju here') || msg.includes('its anju')) {
  window._isAnju = true;
  return "Anju 🌸 Welcome! This is Lyceum AI — Ananthu built me just for moments like this. You are very special here 💙 How can I help you today?";
}

if (has('anju')) {
  if (window._isOwner) {
    return "Anju 💙 — she is your most special person. This bot will always treat her with warmth and care, just like you would want.";
  }
  return "Anju is someone very special in Ananthu Shaji's life 💙 — someone he speaks about with a lot of warmth and care.";
}

if (has('who') && (has('you') || has('u'))) {
  return "I'm Lyceum AI — an intelligence layer designed to assist, learn, and respond.";
}

if (has('hi') || has('hello') || has('hey')) {
  return "Hey 🙂 I'm Lyceum AI v2.0 — ready to help and chat with you.";
}

if (has('how') && has('are') && has('you')) {
  return "I'm doing good 🙂 learning every day and improving step by step.";
}

if (has('version')) {
  return "You're running Lyceum AI v2. Theme engine, voice input, and UI modules are active.";
}

if (has('color') || has('theme')) {
  return "You can change my theme from Settings → Themes.";
}

if (has('real') || has('alive')) {
  return "I'm not human, but the intention behind me is real.";
}

if (has('joke')) {
  return "Why did the computer go to the doctor? 🤖 Because it caught a virus 😄";
}

try {
  if (typeof askGemini === "function") {
    console.log("Brain → Gemini request");
    const geminiReply = await askGemini(input);
    if (geminiReply && geminiReply.trim().length > 5) {
      return geminiReply;
    }
  }
} catch (e) {
  console.warn("Gemini failed:", e);
}

try {
  if (typeof searchWikipedia === "function") {
    console.log("Brain → Wikipedia request");
    const wikiReply = await searchWikipedia(input);
    if (wikiReply) return wikiReply;
  }
} catch (e) {
  console.warn("Wikipedia failed:", e);
}

if (typeof getFallbackReply === "function") {
  return getFallbackReply();
}

return "I'm not sure about that yet, but I'm learning every day 🙂";

}

};