document.addEventListener('DOMContentLoaded', () => {

const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

const sModal = document.getElementById('settings-modal');
const sBtn = document.getElementById('settings-btn');
const cBtn = document.getElementById('close-settings');

const tabAbout = document.getElementById('tab-about');
const tabColors = document.getElementById('tab-colors');
const contentAbout = document.getElementById('content-about');
const contentColors = document.getElementById('content-colors');
const colorGrid = document.getElementById('color-grid');

const colors = [
  '#ffffff','#ff4757','#ff6b81','#ff6348','#ffa502',
  '#eccc68','#feca57','#ff9ff3','#ffafcc',
  '#2ed573','#7bed9f','#1dd1a1','#10ac84',
  '#1e90ff','#70a1ff','#54a0ff','#48dbfb',
  '#5352ed','#5f27cd','#341f97',
  '#747d8c','#57606f','#2f3542',
  '#00d2d3','#01a3a4','#a4b0be'
];

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 500);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const preferredVoice = voices.find(v =>
    /david|male|google us english/i.test(v.name)
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.pitch = 0.9;
  utterance.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;

  micBtn.addEventListener('click', () => {
    try {
      recognition.start();
      micBtn.textContent = '🛑';
    } catch (e) {
      console.warn("Speech recognition already running");
    }
  });

  recognition.onresult = e => {
    userInput.value = e.results[0][0].transcript;
    micBtn.textContent = '🎤';
    handleSend();
  };

  recognition.onerror = () => {
    micBtn.textContent = '🎤';
  };
} else if (micBtn) {
  micBtn.style.display = 'none';
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  if (text === "april8!") {
    window.open("anju/index.html", "_blank");
    userInput.value = "";
    return;
  }

  document.body.classList.add('chat-active');

  const userTime = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  if (window.UI) {
    UI.renderMessage(text, 'user', userTime);
    UI.showTyping(true);
  }

  userInput.value = '';
  let response = null;

  try {
    if (window.Brain && typeof Brain.getResponse === "function") {
      response = await Brain.getResponse(text);
    }
  } catch (err) {
    console.error("Brain engine error:", err);
  }

  if (response) {
    if (window.UI) UI.showTyping(false);
    const botTime = new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    });
    if (text.includes('?')) speak(response);
    if (window.UI) UI.renderMessage(response, 'bot', botTime);
    return;
  }

  try {
    if (window.getKnowledge) {
      response = await getKnowledge(text, toggleWikiLoading);
    }
  } catch (err) {
    console.error("Knowledge engine error:", err);
  }

  if (!response && window.getFallbackReply) {
    response = getFallbackReply();
  }

  if (window.UI) UI.showTyping(false);

  const botTime = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  if (text.includes('?')) speak(response);
  if (window.UI) UI.renderMessage(response, 'bot', botTime);
}

if (sendBtn) sendBtn.addEventListener('click', handleSend);

if (userInput) {
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSend();
  });
}

if (tabColors) {
  tabColors.addEventListener('click', () => {
    contentColors.classList.remove('hidden');
    contentAbout.classList.add('hidden');
    tabColors.classList.add('active');
    tabAbout.classList.remove('active');

    if (!colorGrid.children.length) {
      colors.forEach(color => {
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.background = color;

        dot.onclick = () => {
          document.documentElement.style.setProperty('--accent', color);

          const light = [
            '#ffffff','#eccc68','#7bed9f',
            '#ff9ff3','#d1ccc0','#ffafcc'
          ];

          document.documentElement.style.setProperty(
            '--user-text',
            light.includes(color.toLowerCase()) ? '#000' : '#fff'
          );

          document.documentElement.style.setProperty('--sidebar-bg', color + '1a');
        };

        colorGrid.appendChild(dot);
      });
    }
  });
}

function toggleWikiLoading(show) {
  const loader = document.getElementById("wiki-loading");
  if (!loader) return;
  loader.classList.toggle("hidden", !show);
}

/* ================= LYRA REVEAL ================= */
const lyraModal = document.getElementById("lyra-modal");
const closeBtn = document.getElementById("close-lyra-btn");
const exploreBtn = document.getElementById("explore-lyra-btn");

setTimeout(() => {
  if (lyraModal) {
    lyraModal.classList.remove("hidden");
    setTimeout(() => {
      lyraModal.classList.add("show");
    }, 50);
  }
}, 1500);

function closeLyra() {
  if (!lyraModal) return;
  lyraModal.classList.remove("show");
  setTimeout(() => {
    lyraModal.classList.add("hidden");
  }, 800);
}

if (closeBtn) closeBtn.addEventListener("click", closeLyra);
if (exploreBtn) exploreBtn.addEventListener("click", closeLyra);

});
