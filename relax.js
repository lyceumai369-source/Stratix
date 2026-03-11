
document.addEventListener("DOMContentLoaded", () => {

  let score = 0;
  let rewarded = new Set();
  let leafInterval = null;

  const rewards = {
    50: {
      title: "Bronze Badge 🥉",
      icon: "🥉",
      msg: "Nice start 🌱\nKeep going... Reach 500 for your Official Certificate!"
    },
    100: {
      title: "Silver Badge 🥈",
      icon: "🥈",
      msg: "You're building calm and focus ✨\nThe 500-point Certificate is getting closer."
    },
    200: {
      title: "Gold Badge 🥇",
      icon: "🥇",
      msg: "Impressive 💛\nYou are halfway to earning your Lyceum Achievement!"
    },
    300: {
      title: "Diamond Badge 💎",
      icon: "💎",
      msg: "Elite level 💎\nOnly 200 more points until your downloadable certificate is ready!"
    },
    500: {
      title: "Lyceum AI Completion Certificate 📜",
      icon: "📜",
      msg: "Congratulations! 🎉\n\nYou completed the Challenge.\n\nClick 'Continue' to enter your name and claim your Premium Certificate! 🌿"
    }
  };

  /* ===== CREATE OVERLAY ===== */
  const overlay = document.createElement("div");
  overlay.id = "relaxOverlay";
  overlay.innerHTML = `
    <button id="exitRelax" class="exit-btn">✖</button>

    <div class="relax-card">
      <div class="relax-text" id="relaxText">Choose your game 🌿</div>
      <p id="cert-notice" style="color: #d4af37; font-size: 0.8rem; margin-bottom: 10px;">🏆 Reach 500 points for a Premium Certificate</p>
      <button class="games-btn" id="leafBtn">🍃 Leaf Fall</button>
      <button class="games-btn" id="snakeBtn">🐍 Snake Game</button>
      <button class="games-btn" id="gamesBtn" style="display:none;">🎮 Games</button>
    </div>

    <div id="scoreBoard" class="score-only">Score: 0</div>

    <div id="celebration">
      <div class="celebration-box">
        <div id="celeIcon" style="font-size:50px"></div>
        <h2 id="celeTitle"></h2>
        <p id="celeMsg"></p>
        <button id="closeCele">Continue</button>
      </div>
    </div>

    <div id="exitConfirm" style="display:none;">
      <div class="celebration-box">
        <h3>Exit Relax?</h3>
        <p>Your progress will reset.</p>
        <button id="confirmExit">Exit</button>
        <button id="cancelExit">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ===== INITIAL SETUP ===== */
  document.getElementById("snakeBtn").style.display = "none";
  document.getElementById("leafBtn").style.display = "inline-block";

  /* ===== LEAF LAYER ===== */
  const leafLayer = document.createElement("div");
  leafLayer.id = "leafLayer";
  overlay.appendChild(leafLayer);

  /* ===== OPEN RELAX ===== */
  const relaxBtn = document.getElementById("relaxBtn");
  if (relaxBtn) {
    relaxBtn.addEventListener("click", () => {
      overlay.style.display = "flex";
      document.getElementById("relaxText").style.display = "block";
      document.getElementById("cert-notice").style.display = "block";
      document.getElementById("leafBtn").style.display = "inline-block";
      document.getElementById("snakeBtn").style.display = "inline-block";
      document.getElementById("scoreBoard").style.display = "none";
    });
  }

  /* ===== EXIT CONFIRM ===== */
  document.getElementById("exitRelax").onclick = () => {
    document.getElementById("exitConfirm").style.display = "flex";
  };

  document.getElementById("cancelExit").onclick = () => {
    document.getElementById("exitConfirm").style.display = "none";
  };

  document.getElementById("confirmExit").onclick = () => {
    stopGame();
    document.getElementById("exitConfirm").style.display = "none";
    overlay.style.display = "none";
  };

  /* ===== BUTTON ACTIONS ===== */
  document.getElementById("leafBtn").onclick = () => {
    document.getElementById("relaxText").style.display = "none";
    document.getElementById("cert-notice").style.display = "none";
    document.getElementById("leafBtn").style.display = "none";
    document.getElementById("snakeBtn").style.display = "none";
    document.getElementById("scoreBoard").style.display = "block";

    if (!leafInterval) spawnLeaves();
  };

  document.getElementById("snakeBtn").onclick = () => {
    overlay.style.display = "none"; 
    window.location.href = "./snake-game/";
  };

  /* ===== LEAF GAME ENGINE ===== */
  function spawnLeaves() {
    leafInterval = setInterval(() => {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.textContent = ["🍁", "🍃", "🍂"][Math.floor(Math.random() * 3)];
      leaf.style.left = Math.random() * 100 + "vw";
      leaf.style.animationDuration = (4 + Math.random() * 3) + "s";

      leaf.onclick = () => {
        leaf.style.transition = "0.3s ease";
        leaf.style.transform = "scale(1.6) rotate(180deg)";
        leaf.style.opacity = "0";
        setTimeout(() => leaf.remove(), 300);
        updateScore();
      };

      leafLayer.appendChild(leaf);
      setTimeout(() => leaf.remove(), 8000);
    }, 600);
  }

  /* ===== SCORE LOGIC ===== */
  function updateScore() {
    score++;
    document.getElementById("scoreBoard").textContent = "Score: " + score;

    if (rewards[score] && !rewarded.has(score)) {
      rewarded.add(score);
      showReward(score);
    }
  }

  /* ===== REWARD POPUP ===== */
  function showReward(value) {
    const r = rewards[value];

    document.getElementById("celeIcon").textContent = r.icon;
    document.getElementById("celeTitle").textContent = r.title;
    document.getElementById("celeMsg").textContent = r.msg;
    document.getElementById("celebration").style.display = "flex";

    document.getElementById("closeCele").onclick = () => {
      document.getElementById("celebration").style.display = "none";

      if (value === 500) {
        stopGame();
        // ASKING FOR USER NAME FOR THE CERTIFICATE
        let userName = prompt("Please enter your name for the certificate:");
        if (!userName) userName = "Valued User"; // Fallback name

        // Redirect with name as a URL parameter
        window.location.href = `certificate.html?name=${encodeURIComponent(userName)}`;
      }
    };
  }

  /* ===== RESET STATE ===== */
  function stopGame() {
    if (leafInterval) {
      clearInterval(leafInterval);
      leafInterval = null;
    }
    leafLayer.innerHTML = "";
    score = 0;
    rewarded.clear();
    document.getElementById("scoreBoard").textContent = "Score: 0";
    document.getElementById("relaxText").style.display = "block";
    document.getElementById("leafBtn").style.display = "inline-block";
    document.getElementById("snakeBtn").style.display = "none";
  }
});
