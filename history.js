/* ==========================================
   LYCEUM CHAT HISTORY ENGINE v2
   ChatGPT Style — Each chat saved separately
========================================== */

const HISTORY_KEY = "lyceum_history";

/* ===== GET ALL CHATS ===== */
function getAllChats() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

/* ===== SAVE ALL CHATS ===== */
function saveAllChats(chats) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(chats));
}

/* ===== START NEW CHAT SESSION ===== */
function startNewChat() {
  const chats = getAllChats();

  const newChat = {
    id: Date.now(),
    title: "New Chat",
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }),
    messages: []
  };

  chats.unshift(newChat);
  saveAllChats(chats);

  // Set as active
  window._activeChatId = newChat.id;
  renderHistorySidebar();
  return newChat.id;
}

/* ===== SAVE MESSAGE TO ACTIVE CHAT ===== */
function saveToHistory(userMsg, botMsg) {
  const chats = getAllChats();
  const index = chats.findIndex(c => c.id === window._activeChatId);
  if (index === -1) return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit"
  });

  chats[index].messages.push({ user: userMsg, bot: botMsg, time });

  // Auto title from first message
  if (chats[index].messages.length === 1) {
    const title = userMsg.length > 35 ? userMsg.slice(0, 35) + "..." : userMsg;
    chats[index].title = title;
  }

  saveAllChats(chats);
  renderHistorySidebar();
}

/* ===== LOAD A CHAT SESSION ===== */
function loadChatSession(id) {
  const chats = getAllChats();
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  window._activeChatId = id;

  const messagesArea = document.getElementById("chat-messages");
  if (!messagesArea) return;

  messagesArea.innerHTML = "";

  if (chat.messages.length === 0) return;

  document.body.classList.add("chat-active");

  // Hide suggestions
  const sugBox = document.getElementById("suggestions-box");
  if (sugBox) sugBox.style.display = "none";

  chat.messages.forEach(m => {
    if (window.UI) {
      UI.renderMessage(m.user, "user", m.time);
      UI.renderMessage(m.bot, "bot", m.time);
    }
  });

  // Close sidebar on mobile
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("open");

  renderHistorySidebar();
}

/* ===== DELETE A CHAT ===== */
function deleteChat(id) {
  let chats = getAllChats();
  chats = chats.filter(c => c.id !== id);
  saveAllChats(chats);

  // If deleted active chat, start fresh
  if (window._activeChatId === id) {
    document.getElementById("chat-messages").innerHTML = "";
    document.body.classList.remove("chat-active");
    const sugBox = document.getElementById("suggestions-box");
    if (sugBox) sugBox.style.display = "block";
    window._activeChatId = null;
  }

  renderHistorySidebar();
}

/* ===== CLEAR ALL HISTORY ===== */
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  window._activeChatId = null;
  document.getElementById("chat-messages").innerHTML = "";
  document.body.classList.remove("chat-active");
  const sugBox = document.getElementById("suggestions-box");
  if (sugBox) sugBox.style.display = "block";
  renderHistorySidebar();
}

/* ===== RENDER SIDEBAR ===== */
function renderHistorySidebar() {
  const container = document.getElementById("history-list");
  if (!container) return;

  const chats = getAllChats();
  container.innerHTML = "";

  if (chats.length === 0) {
    container.innerHTML = `<p style="color:#aaa;font-size:12px;padding:10px 0;">No chats yet</p>`;
    return;
  }

  chats.forEach(chat => {
    const item = document.createElement("div");
    item.className = "history-item" + (chat.id === window._activeChatId ? " active-chat" : "");

    item.innerHTML = `
      <div class="history-item-inner" onclick="loadChatSession(${chat.id})">
        <div class="history-item-title">${chat.title}</div>
        <div class="history-item-date">${chat.date}</div>
      </div>
      <button class="history-delete-btn" onclick="event.stopPropagation(); deleteChat(${chat.id})">🗑️</button>
    `;

    container.appendChild(item);
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Start a fresh chat on load
  startNewChat();
  renderHistorySidebar();

  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm("Clear all chat history?")) clearHistory();
    };
  }
});