

const axios = require("axios");
const { zokou } = require("../framework/zokou");

// 🔑 YOUR GOOGLE GEMINI API KEY
const GEMINI_API_KEY = "AQ.Ab8RN6LaCCuFLLmdcMki87XLsquUTVdlPxxHZMA2KeoUXJUxkw";


// ==================== 1. AI CHAT (GOOGLE GEMINI - FREE) ====================

zokou({
    nomCom: "ai",
    aliases: ["ask", "chat", "gpt", "gemini"],
    categorie: "AI",
    reaction: "🤖",
    desc: "Chat with Google Gemini AI"
}, async (dest, zk, commandeOptions) => {

    const { arg, repondre } = commandeOptions;

    if (!arg || !arg[0]) {
        return repondre(
            "❌ Ask me something!\n\n" +
            "📌 Example: .ai What is the capital of France?"
        );
    }

    const question = arg.join(" ");

    await repondre("🤖 *Thinking...*");

    try {

        // Google Gemini API (FREE - 1500 requests/day)
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: question }]
                }]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        if (
            response.data &&
            response.data.candidates &&
            response.data.candidates[0]
        ) {

            const answer =
                response.data.candidates[0].content.parts[0].text;

            return repondre(
                `🤖 *AI Response:*\n\n${answer}`
            );

        } else {

            return repondre("❌ No response from AI.");

        }

    } catch (err) {

        console.log("Gemini Error:", err.message);

        return repondre(
            "❌ AI failed. Try again later."
        );

    }
});


// ==================== 2. AI IMAGE GENERATION ====================

zokou({
    nomCom: "imagine",
    aliases: ["imgai", "aigen", "aiimage", "draw"],
    categorie: "AI",
    reaction: "🎨",
    desc: "Generate AI images with Pollinations"
}, async (dest, zk, commandeOptions) => {

    const { arg, repondre, ms } = commandeOptions;

    if (!arg || !arg[0]) {
        return repondre(
            "❌ Describe an image!\n\n" +
            "📌 Example: .imagine a sunset over the ocean"
        );
    }

    const prompt = arg.join(" ");
    const encodedPrompt = encodeURIComponent(prompt);

    await repondre(
        "🎨 *Generating image...*\n\n" +
        "⏳ This may take 10-15 seconds."
    );

    // Try multiple methods
    const imageUrls = [
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 100000)}`,
        `https://pollinations.ai/p/${encodedPrompt}?width=512&height=512&nologo=true`
    ];

    let sent = false;

    for (let url of imageUrls) {

        if (sent) break;

        try {

            await zk.sendMessage(
                dest,
                {
                    image: {
                        url: url
                    },
                    caption:
                        `🎨 *AI Generated*\n\n📝 ${prompt}`
                },
                {
                    quoted: ms
                }
            );

            sent = true;

        } catch (err) {

            console.log(
                "Image URL failed:",
                url.substring(0, 50)
            );

        }
    }

    if (!sent) {
        return repondre(
            "❌ Failed to generate. Try a different prompt like 'sunset over ocean'."
        );
    }
});
