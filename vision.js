/* =========================================================
   LYCEUM VISION (Image Generation Module)
   ========================================================= */

async function generateImage(userText) {
    // 1. Check if the user wants an image
    // Triggers: "imagine", "generate", "draw", "picture of"
    const triggers = ["imagine", "generate", "draw", "create image", "picture of"];
    
    // Check if the user's text starts with any of these triggers
    const lowerText = userText.toLowerCase();
    const isImageRequest = triggers.some(trigger => lowerText.includes(trigger));

    if (!isImageRequest) return null; // Exit if not an image request

    // 2. Clean the text to get the "Prompt"
    // e.g. "Draw a cat" -> "cat"
    let prompt = lowerText;
    triggers.forEach(trigger => {
        prompt = prompt.replace(trigger, "");
    });
    prompt = prompt.trim();

    if (prompt.length < 2) return "Please describe what you want me to draw! (e.g., 'Draw a neon city')";

    // 3. Generate the Image URL (Using Pollinations.ai - Free & Fast)
    // We add a random number to avoid caching same images
    const seed = Math.floor(Math.random() * 10000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024`;

    // 4. Return the HTML to show the image
    return `
    ### 🎨 Generating Art...
    > *"${prompt}"*
    
    ![Generated Image](${imageUrl})
    
    *Source: Lyceum Vision*`;
}