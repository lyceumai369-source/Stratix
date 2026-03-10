
/* =========================================================
   GOD MODE WATCHDOG v4.1 (Fixed + Stable + AI-Ready)
   Desktop + Mobile Compatible
   ========================================================= */

(function () {

    // ---- CONFIGURATION ZONE ----
   const requiredElements = [
  { id: "send-btn", name: "Send Button" },
  { id: "user-input", name: "Message Input Box" },
  { id: "chat-messages", name: "Chat Display Area" }
];


    // ---- PREVENT DUPLICATE LOG SPAM ----
    const seenErrors = new Set();

    // ---- SETUP HUD ----
    const hud = document.createElement("div");
    hud.id = "watchdog-hud";
    hud.style.cssText = `
        position: fixed;
        z-index: 100000;
        background: rgba(40, 0, 0, 0.95);
        color: #ffcccc;
        font-family: Consolas, Monaco, monospace;
        font-size: 13px;
        padding: 10px;
        border-radius: 8px;
        border: 2px solid #ff4444;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: none;
        flex-direction: column;
        gap: 8px;
        backdrop-filter: blur(4px);
    `;

    // ---- SCREEN DETECTION ----
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        hud.style.bottom = "10px";
        hud.style.left = "2.5%";
        hud.style.width = "95%";
        hud.style.maxHeight = "50vh";
    } else {
        hud.style.top = "20px";
        hud.style.right = "20px";
        hud.style.width = "400px";
        hud.style.maxHeight = "80vh";
    }

    // ---- HEADER ----
    const header = document.createElement("div");
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ff4444;
        padding-bottom: 5px;
        margin-bottom: 5px;
    `;

    header.innerHTML = `
        <strong style="color:#ff5555;">🚨 SYSTEM FAILURE</strong>
        <div style="display:flex; gap:10px;">
            <button id="wd-copy"
                style="background:#550000;border:1px solid #ff4444;
                color:white;cursor:pointer;padding:2px 8px;
                border-radius:4px;font-size:10px;">
                COPY FOR AI
            </button>
            <button id="wd-close"
                style="background:transparent;border:none;
                color:white;cursor:pointer;font-weight:bold;">
                ✕
            </button>
        </div>
    `;

    hud.appendChild(header);

    // ---- CONTENT AREA ----
    const content = document.createElement("div");
    content.id = "wd-content";
    content.style.cssText = `
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
    `;
    hud.appendChild(content);

    document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(hud);

        // ---- BUTTON EVENTS (SAFE BINDING) ----
        hud.querySelector("#wd-close").addEventListener("click", () => {
            hud.style.display = "none";
        });

        hud.querySelector("#wd-copy").addEventListener("click", () => {
            const errors = content.innerText.trim();
            if (!errors) return alert("No errors to copy.");

            const prompt =
`Bro, my bot is broken. These are Watchdog logs:

${errors}

Please analyze and tell me exactly what to fix.`;

            navigator.clipboard.writeText(prompt)
                .then(() => alert("✅ COPIED! Paste into chat."))
                .catch(() => alert("❌ Copy failed. Please select text manually."));
        });
    });

    // ---- HELPER FUNCTIONS ----

    function visualHighlight(element) {
        if (!element || !element.style) return;

        element.style.border = "4px solid red";
        element.style.boxShadow = "0 0 20px red";

        // Auto-remove highlight after 4s
        setTimeout(() => {
            element.style.border = "";
            element.style.boxShadow = "";
        }, 4000);
    }

    function log(title, detail, type = "error") {
        const key = title + detail;
        if (seenErrors.has(key)) return;
        seenErrors.add(key);

        hud.style.display = "flex";

        let icon = "❌";
        if (type === "network") icon = "📡";
        if (type === "dom") icon = "🏗️";
        if (type === "resource") icon = "🖼️";

        const entry = document.createElement("div");
        entry.style.cssText = `
            background: rgba(0,0,0,0.3);
            padding: 8px;
            border-left: 3px solid red;
            word-wrap: break-word;
        `;

        entry.innerHTML = `
            <div style="font-weight:bold;color:#ff8888;margin-bottom:2px;">
                ${icon} ${title}
            </div>
            <div style="color:#ddd;">${detail}</div>
        `;

        content.appendChild(entry);
    }

    // ---- ERROR LISTENERS ----

    // 1. JS Runtime Errors
    window.onerror = function (msg, source, line, col) {
        const file = source ? source.split("/").pop() : "Inline Script";
        log(
            "JAVASCRIPT CRASH",
            `File: <b>${file}</b><br>Line: ${line} | Col: ${col}<br>Error: ${msg}`
        );
        return false;
    };

    // 2. Promise / Fetch Errors
    window.addEventListener("unhandledrejection", (e) => {
        log("ASYNC / API ERROR", `Reason: ${e.reason}`);
    });

    // 3. Resource Loading Errors
    window.addEventListener("error", (e) => {
        const t = e.target;
        if (!t) return;

        visualHighlight(t);

        if (t.tagName === "LINK") {
            log("CSS FILE MISSING", `Could not load:<br>${t.href}`, "resource");
        }
        if (t.tagName === "IMG") {
            log("BROKEN IMAGE", `Could not load:<br>${t.src}`, "resource");
        }
        if (t.tagName === "SCRIPT") {
            log("SCRIPT FAILED", `Could not load:<br>${t.src}`, "resource");
        }
    }, true);

    // 4. Critical DOM Check
    window.addEventListener("load", () => {
        requiredElements.forEach(item => {
            const el = document.getElementById(item.id);
            if (!el) {
                log(
                    "MISSING HTML ID",
                    `Expected <b>id="${item.id}"</b> (${item.name}) but it was not found.<br>
                     Check index.html for renaming.`,
                    "dom"
                );
            }
        });
    });

    // 5. Network Status
    window.addEventListener("offline", () => {
        log("NETWORK LOST", "You are offline. Bot may not respond.", "network");
    });

    window.addEventListener("online", () => {
        log("NETWORK RESTORED", "Connection is back.", "network");
    });

})();
