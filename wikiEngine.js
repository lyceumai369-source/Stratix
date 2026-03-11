/* =========================================================
   KNOWLEDGE ENGINE ELITE (v5.0 - Deep Search & QA)
   ========================================================= */

const wikiCache = new Map();
const memory = [];
const MAX_MEMORY = 10;

// Track Context
let currentSubject = {
    topic: null,
    category: null
};

/* ================= UTILITY: CLEANING ================= */

function cleanText(text) {
    return text.toLowerCase()
        .replace(/(pls|please|can you|tell me|who is|what is|how many|search for|find|hey|bro|lyceum)\b/gi, "")
        .replace(/[?.,!]/g, "")
        .trim();
}

function detectFollowUp(userText) {
    // If the user uses pronouns, they are asking about the PREVIOUS topic
    const pronouns = /\b(he|she|it|they|him|her|his|its)\b/i;
    return pronouns.test(userText) && currentSubject.topic;
}

/* ================= 1. WIKIPEDIA SMART SEARCH (The Fix) ================= */

// This function searches for the BEST article title instead of guessing
async function searchWikipediaTitle(query) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        
        // data[1] contains the list of titles found. We take the first one.
        if (data && data[1] && data[1].length > 0) {
            return data[1][0]; // Return the correct title (e.g., "Pratibha Patil")
        }
        return null;
    } catch (e) {
        return null;
    }
}

/* ================= 2. FETCH SUMMARY ================= */

async function getWikiSummary(title) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

/* ================= 3. DUCKDUCKGO FALLBACK ================= */

async function askDuckDuckGo(query) {
    try {
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
        const data = await res.json();
        
        // If DDG has a direct "Abstract", use it
        if (data.AbstractText) return data.AbstractText;
        
        // If DDG has "RelatedTopics", use the first one (often the answer)
        if (data.RelatedTopics && data.RelatedTopics.length > 0 && data.RelatedTopics[0].Text) {
            return data.RelatedTopics[0].Text;
        }
        
        return null;
    } catch (e) {
        return null;
    }
}

/* ================= MAIN ENGINE ================= */

async function getKnowledge(userText, onLoading) {
    let query = cleanText(userText);
    
    // === SMART CONTEXT SWITCHING ===
    // If user asks "How tall is he?", combine it with previous topic
    if (detectFollowUp(userText)) {
        // Remove the pronoun from the new query
        const queryNoPronoun = query.replace(/\b(he|she|it|they|him|her|his)\b/gi, "").trim();
        query = `${currentSubject.topic} ${queryNoPronoun}`;
    }

    if (!query) return "I'm listening... what do you want to know?";
    
    // Check Cache
    if (wikiCache.has(query)) return wikiCache.get(query);
    if (onLoading) onLoading(true);

    try {
        let response = "";
        
        // STEP 1: Search Wikipedia for the BEST matching title
        // (This fixes the "how many women presidents" issue by finding the real list)
        const bestTitle = await searchWikipediaTitle(query);
        
        let wikiData = null;
        if (bestTitle) {
            // If we found a title, get its summary
            wikiData = await getWikiSummary(bestTitle);
            
            // Update Context (So "how old is she" works next time)
            currentSubject = { topic: bestTitle };
        }

        // STEP 2: Try DuckDuckGo if Wikipedia was weak
        // (DDG is better for direct answers like "height", "net worth")
        let ddgAnswer = null;
        if (!wikiData || wikiData.type === "disambiguation") {
            ddgAnswer = await askDuckDuckGo(query);
        }

        // STEP 3: Construct the final answer
        if (wikiData && wikiData.extract) {
            response = `### 📖 ${wikiData.title}\n${wikiData.extract}\n\n`;
            if (wikiData.description) response += `> *${wikiData.description}*`;
        } 
        else if (ddgAnswer) {
            response = `### 🔍 Answer\n${ddgAnswer}\n\n*Source: Knowledge Web*`;
        } 
        else {
            response = `I searched deep for "**${query}**" but couldn't find a clear answer. Try rephrasing?`;
        }

        // Save to memory
        wikiCache.set(query, response);
        return response;

    } catch (err) {
        console.error(err);
        return "I'm having trouble connecting to the knowledge base.";
    } finally {
        if (onLoading) onLoading(false);
    }
}