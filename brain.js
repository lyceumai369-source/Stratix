window.Brain = {

async getResponse(input) {

const msg = input.toLowerCase().trim();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (word) => new RegExp(`\\b${escape(word)}\\b`, 'i').test(msg);

/* ===========================
   HANDLE ATTACHED FILES
=========================== */
if (window._attachedFile) {
  const attached = window._attachedFile;
  window._attachedFile = null;
  if (typeof removeAttachPreview === "function") removeAttachPreview();

  if (attached.type === "image") {
    try {
      if (window.UI) window.UI.showTyping(true);
      const base64 = await fileToBase64(attached.file);
      const reply = await window.askGroqVision(base64, attached.mimeType, input);
      if (window.UI) window.UI.showTyping(false);
      return `🖼️ **Image Analysis** *(${attached.name})*\n\n${reply}`;
    } catch(e) {
      if (window.UI) window.UI.showTyping(false);
      return "Sorry, I couldn't analyze that image.";
    }
  }

  if (attached.type === "pdf") {
    try {
      if (window.UI) window.UI.showTyping(true);

      // Show loading message
      const loadMsg = "📄 Reading your PDF... this may take a moment!";
      if (window.UI) window.UI.renderMessage(loadMsg, "bot",
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );

      const pdfText = await readPDF(attached.file);
      if (!pdfText) {
        if (window.UI) window.UI.showTyping(false);
        return "I couldn't extract text from this PDF. It might be scanned or image-based.";
      }

      window._currentPDFText = pdfText;
      const reply = await window.askGroqAboutPDF(pdfText, input);
      if (window.UI) window.UI.showTyping(false);
      return `📄 **PDF Analysis** *(${attached.name})*\n\n${reply}`;
    } catch(e) {
      if (window.UI) window.UI.showTyping(false);
      return "Sorry, I couldn't read that PDF.";
    }
  }
}

/* ===========================
   IF PDF IS LOADED, USE IT
=========================== */
if (window._currentPDFText && (
  msg.includes("pdf") || msg.includes("document") ||
  msg.includes("file") || msg.includes("summarize") ||
  msg.includes("what does") || msg.includes("explain")
)) {
  const reply = await window.askGroqAboutPDF(window._currentPDFText, input);
  return `📄 ${reply}`;
}

/* ===========================
   SPECIAL REPLIES
=========================== */
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

if (msg.includes("ananthu login 2025") || msg.includes("owner mode on")) {
  window._isOwner = true;
  window._isAnju = false;
  return "Welcome back, Ananthu 👑 I know it's you — my creator 💙 Everything you built is running perfectly. What are we working on today?";
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
  return "You're running Lyceum AI v2. Theme engine, voice input, vision and UI modules are active.";
}

if (has('real') || has('alive')) {
  return "I'm not human, but the intention behind me is real.";
}

if (has('joke')) {
  return "Why did the computer go to the doctor? 🤖 Because it caught a virus 😄";
}

/* ===========================
   GROQ AI
=========================== */
try {
  if (typeof askGemini === "function") {
    console.log("Brain → Groq request");
    const groqReply = await askGemini(input);
    if (groqReply && groqReply.trim().length > 5) {
      return groqReply;
    }
  }
} catch (e) {
  console.warn("Groq failed:", e);
}

/* ===========================
   WIKIPEDIA FALLBACK
=========================== */
try {
  if (typeof getKnowledge === "function") {
    const wikiReply = await getKnowledge(input);
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
