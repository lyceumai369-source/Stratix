/* =========================================================
   UI MANAGER (v7.2 - CLEAN & STABLE)
   ========================================================= */

const style = document.createElement("style");
style.innerHTML = `
  .img-loading-spinner {
    width: 40px; height: 40px;
    border: 4px solid rgba(255,255,255,0.1);
    border-top-color: #4facfe;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .smart-image-box {
    position: relative;
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    margin-bottom: 10px;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .smart-image-box img {
    width: 100%;
    height: auto;
    display: block;
    opacity: 0;
    transition: opacity 0.8s ease;
  }
  .smart-image-box.loaded img { opacity: 1; }
  .smart-image-box.loaded .loader-wrapper { display: none; }

  .watermark-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 8px 12px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    pointer-events: none;
  }
`;
document.head.appendChild(style);

/* =========================================================
   CHAT UI
   ========================================================= */

window.UI = {

  get chatContainer() { return document.getElementById("chat-container"); },
  get messagesArea() { return document.getElementById("chat-messages"); },
  get typingInd() { return document.getElementById("typing-indicator"); },

  renderMessage(text, type, time = "") {
    if (type === "user" && !document.body.classList.contains("chat-active")) {
      document.body.classList.add("chat-active");
    }

    if (!this.messagesArea) return;

    const msg = document.createElement("div");
    msg.className = `message ${type}`;

    const content = document.createElement("div");
    content.className = "msg-content";

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = time;

    msg.appendChild(content);
    msg.appendChild(timestamp);
    this.messagesArea.appendChild(msg);

    if (type !== "bot") {
      content.textContent = text;
      this.scrollToBottom();
      return;
    }

    if (this.containsMarkdownImage(text) || this.containsLink(text)) {
      content.innerHTML = this.parseContent(text);
      this.activateImageLoaders(content);
      this.scrollToBottom();
    } else {
      this.typeEffect(content, text);
    }
  },

  typeEffect(el, text) {
    let i = 0;
    el.textContent = "";
    const loop = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        this.scrollToBottom(false);
        setTimeout(loop, 15);
      } else {
        this.scrollToBottom();
      }
    };
    loop();
  },

  containsMarkdownImage(t) { return /!\[.*?\]\(.*?\)/.test(t); },
  containsLink(t) { return /(https?:\/\/[^\s]+)/i.test(t); },

  parseContent(text) {
    let html = text;
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) =>
      `<div class="smart-image-box">
        <div class="loader-wrapper">
          <div class="img-loading-spinner"></div>
          <div style="color:white;font-size:10px;margin-top:5px;">Creating Art...</div>
        </div>
        <img src="${url}" alt="${alt}" loading="lazy">
        <div class="watermark-overlay">✨ Lyceum AI</div>
      </div>`
    );
    html = html.replace(/((?<!src=")https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');
    html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    return html;
  },

  activateImageLoaders(container) {
    container.querySelectorAll("img").forEach(img => {
      img.onload = () => img.closest(".smart-image-box")?.classList.add("loaded");
      if (img.complete) img.onload();
    });
  },

  showTyping(show) {
    if (!this.typingInd) return;
    this.typingInd.classList.toggle("hidden", !show);
    this.scrollToBottom();
  },

  scrollToBottom(smooth = true) {
    if (!this.chatContainer) return;
    requestAnimationFrame(() => {
      this.chatContainer.scrollTo({
        top: this.chatContainer.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      });
    });
  }
};

/* =========================================================
   SIDEBAR + SETTINGS + THEME
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsBtn = document.getElementById("settings-btn");
  const themeBtn = document.getElementById("theme-toggle-btn");
  const closeSettings = document.getElementById("close-settings");
  const settingsModal = document.getElementById("settings-modal");

  const tabAbout = document.getElementById("tab-about");
  const tabColors = document.getElementById("tab-colors");
  const contentAbout = document.getElementById("content-about");
  const contentColors = document.getElementById("content-colors");
  const colorGrid = document.getElementById("color-grid");
  const relaxBtn = document.getElementById("relaxBtn");

  const closeSidebar = () => {
    if (sidebar?.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  };

  if (menuToggle) {
    menuToggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      sidebar.classList.toggle("open");
    };
  }

  document.addEventListener("click", (e) => {
    if (
      sidebar?.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  settingsBtn && (settingsBtn.onclick = () => {
    settingsModal.classList.remove("hidden");
    closeSidebar();
  });

  closeSettings && (closeSettings.onclick = () =>
    settingsModal.classList.add("hidden")
  );

  themeBtn && (themeBtn.onclick = () => {
    document.body.classList.toggle("light-mode");
    themeBtn.innerText =
      document.body.classList.contains("light-mode")
        ? "🌙 Dark Mode"
        : "☀️ Light Mode";
    closeSidebar();
  });

  relaxBtn && (relaxBtn.onclick = closeSidebar);

  if (tabAbout && tabColors) {
    tabAbout.onclick = () => {
      tabAbout.classList.add("active");
      tabColors.classList.remove("active");
      contentAbout.classList.remove("hidden");
      contentColors.classList.add("hidden");
    };
    tabColors.onclick = () => {
      tabColors.classList.add("active");
      tabAbout.classList.remove("active");
      contentColors.classList.remove("hidden");
      contentAbout.classList.add("hidden");
    };
  }

  if (colorGrid && !colorGrid.children.length) {
    ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#6366f1","#14b8a6","#f97316","#06b6d4"]
      .forEach(c => {
        const dot = document.createElement("div");
        dot.className = "color-dot";
        dot.style.backgroundColor = c;
        dot.onclick = () =>
          document.documentElement.style.setProperty("--accent", c);
        colorGrid.appendChild(dot);
      });
  }
});
