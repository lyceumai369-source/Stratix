/* ==========================================
   LYCEUM AI — SMART SUGGESTIONS ENGINE
========================================== */

const allSuggestions = [
  // Tech & Coding
  "How does artificial intelligence work?",
  "What is machine learning?",
  "Explain quantum computing simply",
  "What is the difference between AI and ML?",
  "How does the internet actually work?",
  "What is blockchain technology?",
  "How do neural networks learn?",
  "What is cloud computing?",
  "Explain APIs in simple words",
  "What is cybersecurity?",

  // Science
  "How was the universe created?",
  "What is dark matter?",
  "How do black holes form?",
  "What is DNA and how does it work?",
  "How does the human brain work?",
  "What is the theory of relativity?",
  "How do vaccines work?",
  "What is quantum physics?",
  "How old is the universe?",
  "What is the speed of light?",

  // Space
  "Is there life on other planets?",
  "How far away is the nearest star?",
  "What happens inside a black hole?",
  "How big is the Milky Way galaxy?",
  "Will humans ever live on Mars?",
  "What is a neutron star?",
  "How do rockets work?",
  "What is the James Webb telescope?",

  // History & World
  "Who was the most powerful person in history?",
  "What caused World War 2?",
  "How did ancient Egypt build the pyramids?",
  "What was the Roman Empire?",
  "Who invented the internet?",
  "What is the oldest civilization?",
  "How did humans evolve?",

  // Philosophy & Life
  "What is the meaning of life?",
  "Does free will actually exist?",
  "What happens after we die?",
  "Is time travel possible?",
  "What makes a person truly successful?",
  "Can AI ever be conscious?",
  "What is happiness?",
  "Is the universe infinite?",

  // Fun & Creative
  "Tell me something mind blowing",
  "What is the most mysterious place on Earth?",
  "What are the strangest facts about space?",
  "What would happen if the sun disappeared?",
  "What is the most dangerous animal on Earth?",
  "What is the deepest part of the ocean?",
  "What is the rarest thing in the universe?",
  "Tell me a fun science fact",

  // Personal & Chat
  "Who created you?",
  "What can you do?",
  "How smart are you?",
  "What do you think about AI?",
  "Are you better than ChatGPT?",
  "What is Lyceum AI?",
];

function getRandomSuggestions(count = 4) {
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function renderSuggestions() {
  const box = document.getElementById("suggestion-chips");
  if (!box) return;

  box.innerHTML = "";

  const selected = getRandomSuggestions(4);

  selected.forEach(text => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = text;

    chip.onclick = () => {
      const input = document.getElementById("user-input");
      if (input) {
        input.value = text;
        // Hide suggestions
        const sugBox = document.getElementById("suggestions-box");
        if (sugBox) sugBox.style.display = "none";
        // Auto send
        const sendBtn = document.getElementById("send-btn");
        if (sendBtn) sendBtn.click();
      }
    };

    box.appendChild(chip);
  });
}

// Hide suggestions when chat starts
document.addEventListener("DOMContentLoaded", () => {
  renderSuggestions();

  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");

  const hideSuggestions = () => {
    const sugBox = document.getElementById("suggestions-box");
    if (sugBox) sugBox.style.display = "none";
  };

  if (sendBtn) sendBtn.addEventListener("click", hideSuggestions);
  if (userInput) {
    userInput.addEventListener("keydown", e => {
      if (e.key === "Enter") hideSuggestions();
    });
  }
});