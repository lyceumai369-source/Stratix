/* ==========================================
   LYCEUM VISION ENGINE
   Image Reader + PDF Reader + Web Search
========================================== */

/* ===========================
   WEB SEARCH ENGINE
=========================== */
async function searchWeb(query) {
  try {
    // Try Wikipedia search first for factual queries
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`;
    const wikiRes = await fetch(wikiUrl);
    const wikiData = await wikiRes.json();

    let results = [];

    // Get Wikipedia summaries
    if (wikiData[1] && wikiData[1].length > 0) {
      for (let i = 0; i < Math.min(2, wikiData[1].length); i++) {
        const title = wikiData[1][i];
        try {
          const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          const summaryData = await summaryRes.json();
          if (summaryData.extract) {
            results.push(`📖 **${summaryData.title}**: ${summaryData.extract.slice(0, 300)}...`);
          }
        } catch(e) {}
      }
    }

    // Also try DuckDuckGo for additional context
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl);
      const ddgData = await ddgRes.json();
      if (ddgData.AbstractText) {
        results.push(`🔍 ${ddgData.AbstractText}`);
      }
    } catch(e) {}

    if (results.length === 0) return null;

    return `🌐 **Web Search: "${query}"**\n\n${results.join("\n\n")}`;

  } catch (e) {
    console.warn("Web search failed:", e);
    return null;
  }
}
    const res = await fetch(url);
    const data = await res.json();

    let results = [];

    if (data.AbstractText) {
      results.push(`📖 ${data.AbstractText}`);
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 3).forEach(topic => {
        if (topic.Text) results.push(`• ${topic.Text}`);
      });
    }

    if (results.length === 0) return null;

    return `🔍 **Web Search Results for "${query}"**\n\n${results.join("\n\n")}`;
  } catch (e) {
    console.warn("Web search failed:", e);
    return null;
  }
}

/* ===========================
   IMAGE READER (Groq Vision)
=========================== */
async function readImageWithGroq(base64Image, mimeType, userQuestion) {
  const API_KEY = "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";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const question = userQuestion || "Describe this image in detail. What do you see?";

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
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              },
              {
                type: "text",
                text: question
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
}

/* ===========================
   PDF READER
=========================== */
async function readPDF(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);

        // Load PDF.js from CDN
        if (!window.pdfjsLib) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }

        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = "";
        const maxPages = Math.min(pdf.numPages, 10); // Max 10 pages

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(" ");
          fullText += `\n[Page ${i}]: ${pageText}`;
        }

        if (pdf.numPages > 10) {
          fullText += `\n\n[Note: Showing first 10 of ${pdf.numPages} pages]`;
        }

        resolve(fullText.trim());
      } catch (err) {
        console.error("PDF error:", err);
        resolve(null);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ===========================
   FILE TO BASE64
=========================== */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===========================
   EXPOSE GLOBALLY
=========================== */
window.searchWeb = searchWeb;
window.readImageWithGroq = readImageWithGroq;
window.readPDF = readPDF;
window.fileToBase64 = fileToBase64;

