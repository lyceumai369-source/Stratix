/* ==========================================
   LYCEUM CHAT HISTORY ENGINE
   Saves all chats in browser storage
========================================== */

const HISTORY_KEY = "lyceum_chat_history";
const MAX_HISTORY_SESSIONS = 50;

/* ===== SAVE MESSAGE TO HISTORY ===== */
function saveToHistory(userMsg, botMsg) {
  const history = getFullHistory();

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit"
  });

  // Find today's session or create new one
  let todaySession = history.find(s => s.date === today);

  if (!todaySession) {
    todaySession = { date: today, messages: [] };
    history.unshift(todaySession);
  }

  todaySession.messages.push({ user: userMsg, bot: botMsg, time });

  // Keep only last 50 sessions
  if (history.length > MAX_HISTORY_SESSIONS) {
    history.pop();
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistorySidebar();
}

/* ===== GET FULL HISTORY ===== */
function getFullHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

/* ===== CLEAR ALL HISTORY ===== */
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistorySidebar();
}

/* ===== RENDER HISTORY IN SIDEBAR ===== */
function renderHistorySidebar() {
  const container = document.getElementById("history-list");
  if (!container) return;

  const history = getFullHistory();
  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `<p style="color:#aaa;font-size:12px;padding:10px;">No history yet</p>`;
    return;
  }

  history.forEach((session, index) => {
    const sessionEl = document.createElement("div");
    sessionEl.className = "history-session";

    const firstMsg = session.messages[0]?.user || "Chat";
    const preview = firstMsg.length > 30 ? firstMsg.slice(0, 30) + "..." : firstMsg;

    sessionEl.innerHTML = `
      <div class="history-date">${session.date}</div>
      <div class="history-preview">${preview}</div>
    `;

    sessionEl.onclick = () => loadHistorySession(index);
    container.appendChild(sessionEl);
  });
}

/* ===== LOAD OLD CHAT SESSION ===== */
function loadHistorySession(index) {
  const history = getFullHistory();
  const session = history[index];
  if (!session) return;

  const messagesArea = document.getElementById("chat-messages");
  if (!messagesArea) return;

  messagesArea.innerHTML = "";
  document.body.classList.add("chat-active");

  session.messages.forEach(m => {
    if (window.UI) {
      UI.renderMessage(m.user, "user", m.time);
      UI.renderMessage(m.bot, "bot", m.time);
    }
  });
}

/* ===== AUTO RENDER ON LOAD ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderHistorySidebar();

  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn) clearBtn.onclick = () => {
    if (confirm("Clear all chat history?")) clearHistory();
  };
});