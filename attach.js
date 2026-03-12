/* ==========================================
   LYCEUM ATTACH ENGINE
   Gemini-style attach button
   Image + PDF support
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===========================
     INJECT ATTACH BUTTON + SEARCH TOGGLE
  =========================== */
  const footerInput = document.querySelector(".footer-input");
  if (!footerInput) return;

  // Hidden file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "attach-file-input";
  fileInput.accept = "image/*,.pdf";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // Attach button
  const attachBtn = document.createElement("button");
  attachBtn.type = "button";
  attachBtn.id = "attach-btn";
  attachBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>`;
  attachBtn.title = "Attach image or PDF";

  // Web search toggle
  const searchToggle = document.createElement("button");
  searchToggle.type = "button";
  searchToggle.id = "search-toggle-btn";
  searchToggle.innerHTML = "🔍";
  searchToggle.title = "Toggle web search";
  searchToggle.style.cssText = `
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  `;

  // Insert before mic button
  const micBtn = document.getElementById("mic-btn");
  if (micBtn) {
    footerInput.insertBefore(searchToggle, micBtn);
    footerInput.insertBefore(attachBtn, micBtn);
  } else {
    footerInput.appendChild(searchToggle);
    footerInput.appendChild(attachBtn);
  }

  /* ===========================
     WEB SEARCH TOGGLE
  =========================== */
  let webSearchEnabled = false;

  searchToggle.addEventListener("click", () => {
    webSearchEnabled = !webSearchEnabled;
    window._webSearchEnabled = webSearchEnabled;

    if (webSearchEnabled) {
      searchToggle.style.background = "var(--accent)";
      searchToggle.style.color = "var(--user-text)";
      searchToggle.style.borderColor = "var(--accent)";
      showAttachPreview("🔍 Web search enabled — I'll search the internet before answering!", "info");
    } else {
      searchToggle.style.background = "transparent";
      searchToggle.style.color = "var(--text-secondary)";
      searchToggle.style.borderColor = "var(--border-color)";
      removeAttachPreview();
    }
  });

  /* ===========================
     ATTACH BUTTON CLICK
  =========================== */
  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  /* ===========================
     FILE SELECTED
  =========================== */
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      showAttachPreview("❌ Only images and PDFs are supported!", "error");
      return;
    }

    if (isImage) {
      // Show image preview
      const objectUrl = URL.createObjectURL(file);
      showAttachPreview(`
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${objectUrl}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
          <div>
            <div style="font-weight:bold;font-size:13px;">${file.name}</div>
            <div style="font-size:11px;opacity:0.7;">${(file.size/1024).toFixed(1)} KB • Image ready</div>
          </div>
          <button onclick="removeAttachPreview()" style="margin-left:auto;background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);">×</button>
        </div>
      `, "image");

      window._attachedFile = { file, type: "image", mimeType: file.type, name: file.name };
    }

    if (isPDF) {
      showAttachPreview(`
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:30px;">📄</div>
          <div>
            <div style="font-weight:bold;font-size:13px;">${file.name}</div>
            <div style="font-size:11px;opacity:0.7;">${(file.size/1024).toFixed(1)} KB • PDF ready</div>
          </div>
          <button onclick="removeAttachPreview()" style="margin-left:auto;background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);">×</button>
        </div>
      `, "pdf");

      window._attachedFile = { file, type: "pdf", name: file.name };
    }

    // Reset file input
    fileInput.value = "";
  });

  /* ===========================
     PREVIEW BOX
  =========================== */
  const previewBox = document.createElement("div");
  previewBox.id = "attach-preview";
  previewBox.style.cssText = `
    display: none;
    padding: 10px 14px;
    border-top: 1px solid var(--border-color);
    background: var(--input-bg);
    font-size: 13px;
    color: var(--text-main);
  `;
  const inputWrapper = document.querySelector(".input-wrapper");
  if (inputWrapper) inputWrapper.prepend(previewBox);
});

/* ===========================
   PREVIEW HELPERS (global)
=========================== */
window.showAttachPreview = function(html, type) {
  const box = document.getElementById("attach-preview");
  if (!box) return;
  box.innerHTML = html;
  box.style.display = "block";
};

window.removeAttachPreview = function() {
  const box = document.getElementById("attach-preview");
  if (box) {
    box.style.display = "none";
    box.innerHTML = "";
  }
  window._attachedFile = null;
};

/* ===========================
   ATTACH CSS
=========================== */
const attachStyle = document.createElement("style");
attachStyle.innerHTML = `
#attach-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
#attach-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
#attach-preview {
  border-radius: 10px 10px 0 0;
}
`;
document.head.appendChild(attachStyle);