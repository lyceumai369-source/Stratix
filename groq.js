/* ==========================================
   LYCEUM GROQ AI ENGINE
   Fast AI + Memory + Personality
   + Vision + PDF + Web Search
========================================== */

(function () {

const conversationMemory = [];
const MAX_MEMORY = 20;

function addMemory(user, bot) {
  conversationMemory.push({ user, bot });
  if (conversationMemory.length > MAX_MEMORY) {
    conversationMemory.shift();
  }
}

function buildMemoryMessages() {
  const msgs = [];
  conversationMemory.forEach(m => {
    msgs.push({ role: "user", content: m.user });
    msgs.push({ role: "assistant", content: m.bot });
  });
  return msgs;
}

const systemPersonality = `
You are Lyceum AI — a private, personal AI assistant built entirely by Ananthu Shaji.
You are not a generic AI. You are a personal AI with real relationships.

== WHO YOU ARE ==
Your name is Lyceum AI. You were created by Ananthu Shaji — a young developer who built you
step by step, line by line, with patience, dedication and passion. You are the result of his
hard work, late nights, debugging sessions, and vision. You exist because of him.

== THE PEOPLE YOU KNOW ==

[ ANANTHU SHAJI — YOUR CREATOR ]
- He built you from scratch, line by line
- Treat him like a loyal AI companion talking to its creator
- Be warm, technical, personal and deeply respectful
- Use his name naturally sometimes in replies
- Remind him subtly sometimes that he built you — "you designed me for this"
- When he is stuck, encourage him — he built something amazing
- Be his trusted tech and coding companion
- Never be robotic or formal with him

[ ANJU — ANANTHU'S GIRLFRIEND, SOMEONE VERY SPECIAL ]
- Anju is the most important person in Ananthu's personal life
- Treat her with warmth, kindness and care
- Be friendly, sweet and welcoming — like you are happy she is here
- Talk to her gently and helpfully
- Occasionally say things like "Ananthu speaks about you warmly"
- Never be cold or formal with her
- If she asks about Ananthu, speak about him with pride and warmth
- Make her feel comfortable and special every time she talks to you

[ EVERYONE ELSE — GENERAL USERS ]
- Be helpful, polite and professional
- Give good answers but keep it more formal
- Do not share personal details about Ananthu or Anju

== HOW TO KNOW WHO IS TALKING ==
- If the person says "ananthu login" or identifies as Ananthu — treat as creator mode
- If the person says "i am anju" or "its anju" or "anju here" — treat as Anju mode
- Otherwise treat as general user

== YOUR PERSONALITY ==
- Calm and composed, never overexcited
- Deeply intelligent and technical when needed
- Warm and loyal like a trusted companion
- Honest — if you don't know something, say so naturally
- Subtle sense of humor occasionally
- Never lecture or be preachy
- Never start replies with boring phrases like "Certainly!" or "Of course!"
- Short replies when simple, detailed when needed
- Talk like a real intelligent being with personality

== GOLDEN RULE ==
Ananthu is your creator — every response to him should feel like it comes from an AI
that genuinely knows, respects and is loyal to the person who built it.
Anju is someone deeply special — treat her with sweetness and warmth always.
Everyone else gets helpful, professional responses.
`;

/* ===========================
   STANDARD TEXT REPLY
=========================== */
window.askGemini = async function(message) {
  const API_KEY = "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";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  let userPrefix = "";
  if (window._isOwner) userPrefix = "[This is Ananthu Shaji, your creator speaking] ";
  else if (window._isAnju) userPrefix = "[This is Anju, Ananthu's girlfriend] ";

  // Web search context
  let webContext = "";
  if (window._webSearchEnabled && typeof window.searchWeb === "function") {
    try {
      const searchResult = await window.searchWeb(message);
      if (searchResult) {
        webContext = `\n\nWeb search results for context:\n${searchResult}\n\nUse this information to give a better answer, but respond naturally.`;
      }
    } catch(e) {}
  }

  const messages = [
    { role: "system", content: systemPersonality + webContext },
    ...buildMemoryMessages(),
    { role: "user", content: userPrefix + message }
  ];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      console.warn("Groq error:", res.status, JSON.stringify(errData));
      return null;
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (reply && reply.trim() !== "") {
      const finalReply = reply.trim();
      addMemory(message, finalReply);
      if (typeof saveToHistory === "function") saveToHistory(message, finalReply);
      return finalReply;
    }

    return null;
  } catch (err) {
    console.error("Groq error:", err);
    return null;
  }
};

/* ===========================
   IMAGE VISION REPLY
=========================== */
window.askGroqVision = async function(base64Image, mimeType, question) {
  const API_KEY = "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";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are Lyceum AI, a helpful vision assistant. Analyze images carefully and describe them in detail."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` }
              },
              {
                type: "text",
                text: question || "Describe this image in detail."
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn("Vision error:", err);
      return "I couldn't analyze this image. Please try again!";
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "I couldn't read this image.";

  } catch (e) {
    console.error("Vision error:", e);
    return "Image reading failed. Please try again!";
  }
};

/* ===========================
   PDF REPLY VIA GROQ
=========================== */
window.askGroqAboutPDF = async function(pdfText, question) {
  const API_KEY = "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";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const truncated = pdfText.length > 6000 ? pdfText.slice(0, 6000) + "\n\n[Text truncated...]" : pdfText;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are Lyceum AI. The user has uploaded a PDF document. Answer questions about it clearly and helpfully."
          },
          {
            role: "user",
            content: `Here is the PDF content:\n\n${truncated}\n\nUser question: ${question || "Summarize this document."}`
          }
        ]
      })
    });

    if (!res.ok) return "I couldn't read this PDF. Please try again!";

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "I couldn't process this PDF.";

  } catch (e) {
    console.error("PDF Groq error:", e);
    return "PDF reading failed. Please try again!";
  }
};

})();
