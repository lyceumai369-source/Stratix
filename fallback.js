
(function () {
  const fallbackReplies = [
    "Hmm 🤔 I’m still learning that, bro.",
    "I don’t fully know this yet, but I’m improving every day 🙂",
    "That’s interesting! I’m in my initial phase right now.",
    "I’m not sure about that yet, bro. Soon I’ll be smarter 💡",
    "I’m still under development, but I’ll get there 💪"
  ];

  window.getFallbackReply = function () {
    const index = Math.floor(Math.random() * fallbackReplies.length);
    return fallbackReplies[index];
  };
})();
