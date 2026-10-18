const { zokou } = require("../framework/zokou");
const fetch = require("node-fetch");

zokou({
    nomCom: "translate",
    aliases: ["trt", "tr"],
    categorie: "Utility"
}, async (dest, zk, commandeOptions) => {

    const { arg, repondre, ms } = commandeOptions;

    try {
        // Typing indicator
        await zk.presenceSubscribe(dest);
        await zk.sendPresenceUpdate("composing", dest);

        let textToTranslate = "";
        let lang = "";

        // Check if replying to a message
        const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quoted) {
            textToTranslate =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";

            lang = arg[0];
        } else {
            if (arg.length < 2) {
                return repondre(`🌐 *NEXUS-AI TRANSLATOR*

📌 *Usage:*
• Reply → .trt <lang>
• Direct → .trt <text> <lang>

📌 *Example:*
.trt hello fr

🌍 *Languages:*
fr - French | es - Spanish  
de - German | it - Italian  
pt - Portuguese | ru - Russian  
ja - Japanese | ko - Korean  
zh - Chinese | ar - Arabic  
hi - Hindi`);
            }

            lang = arg[arg.length - 1];
            textToTranslate = arg.slice(0, -1).join(" ");
        }

        if (!textToTranslate) {
            return repondre("❌ No text found to translate.");
        }

        let translatedText = null;

        // API 1 (Google)
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            const data = await res.json();

            if (data?.[0]?.[0]?.[0]) {
                translatedText = data[0][0][0];
            }
        } catch {}

        // API 2 (MyMemory)
        if (!translatedText) {
            try {
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
                const data = await res.json();

                if (data?.responseData?.translatedText) {
                    translatedText = data.responseData.translatedText;
                }
            } catch {}
        }

        // API 3 (Backup)
        if (!translatedText) {
            try {
                const res = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
                const data = await res.json();

                if (data?.translated) {
                    translatedText = data.translated;
                }
            } catch {}
        }

        if (!translatedText) {
            return repondre("❌ Translation failed. Try again later.");
        }

        // Final response (modern style)
        await zk.sendMessage(dest, {
            text: `🌐 *NEXUS-AI TRANSLATOR*

📝 *Text:* ${textToTranslate}
🌍 *Lang:* ${lang}

✨ *Result:*
${translatedText}`,
            contextInfo: {
                externalAdReply: {
                    title: "NEXUS-AI Translator",
                    body: "Fast & Accurate Translation",
                    sourceUrl: "https://github.com/officialpkdiller",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: ms });

    } catch (e) {
        console.error("Translate Error:", e);
        repondre("❌ Error occurred while translating.");
    }
});
