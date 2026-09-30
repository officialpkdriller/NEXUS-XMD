const { zokou } = require("../framework/zokou");
const axios = require("axios");

// ═══════════════════════════════════════════════════════════
//                    NEXUS-AI • YOUTUBE AUDIO
// ═══════════════════════════════════════════════════════════

const YT_API = "https://apiziaul.vercel.app/api/downloader/ytmp3";

zokou({
    nomCom: "youtube",
    aliases: ["ytmp3", "yta", "ytaudio"],
    categorie: "Download",
    reaction: "🎧",
    desc: "Download YouTube audio from a YouTube link"
}, async (dest, zk, commandeOptions) => {

    const {
        repondre,
        arg,
        ms
    } = commandeOptions;

    const url = Array.isArray(arg)
        ? arg[0]
        : String(arg || "").trim().split(/\s+/)[0];

    // ═══════════════════════════════════════════════════
    // Missing URL
    // ═══════════════════════════════════════════════════

    if (!url) {
        return repondre(
            `╭━━〔 🎧 NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *YOUTUBE AUDIO*\n` +
            `┃\n` +
            `┃  Send a valid YouTube link\n` +
            `┃  to download its audio.\n` +
            `┃\n` +
            `┃  Example:\n` +
            `┃  .youtube https://youtu.be/xxxxx\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }

    // ═══════════════════════════════════════════════════
    // Validate YouTube URL
    // ═══════════════════════════════════════════════════

    const ytRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

    if (!ytRegex.test(url)) {
        return repondre(
            `╭━━〔 ⚠️ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *INVALID YOUTUBE LINK*\n` +
            `┃\n` +
            `┃  Please provide a valid\n` +
            `┃  YouTube URL.\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }

    try {

        // ═══════════════════════════════════════════════════
        // Processing reaction
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(dest, {
            react: {
                text: "⏳",
                key: ms.key
            }
        });

        // ═══════════════════════════════════════════════════
        // Request download information
        // ═══════════════════════════════════════════════════

        const { data } = await axios.get(YT_API, {
            params: {
                url: url
            },
            timeout: 60000
        });

        // ═══════════════════════════════════════════════════
        // Validate API response
        // ═══════════════════════════════════════════════════

        if (
            !data ||
            !data.status ||
            !data.result ||
            !data.result.downloadUrl
        ) {

            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });

            return repondre(
                `╭━━〔 ❌ NEXUS-AI 〕━━╮\n` +
                `┃\n` +
                `┃  *DOWNLOAD FAILED*\n` +
                `┃\n` +
                `┃  I couldn't fetch the audio.\n` +
                `┃\n` +
                `┃  Check the YouTube link\n` +
                `┃  and try again.\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const title =
            data.result.title ||
            "YouTube Audio";

        const downloadUrl =
            data.result.downloadUrl;

        // ═══════════════════════════════════════════════════
        // Send audio
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(
            dest,
            {
                audio: {
                    url: downloadUrl
                },

                mimetype: "audio/mpeg",

                fileName:
                    `${title.replace(/[\\/:*?"<>|]/g, "_")}.mp3`,

                caption:
                    `╭━━〔 🎧 NEXUS-AI 〕━━╮\n` +
                    `┃\n` +
                    `┃  *${title}*\n` +
                    `┃\n` +
                    `┃  🎵 Format : MP3\n` +
                    `┃  📥 Source : YouTube\n` +
                    `┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯\n` +
                    `> ⚡ Powered by NEXUS-AI`
            },
            {
                quoted: ms
            }
        );

        // ═══════════════════════════════════════════════════
        // Success reaction
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(dest, {
            react: {
                text: "✅",
                key: ms.key
            }
        });

    } catch (error) {

        console.error(
            "NEXUS-AI YOUTUBE AUDIO ERROR:",
            error?.response?.data || error
        );

        // Error reaction
        try {
            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });
        } catch {}

        // API errors
        if (error?.response?.status === 429) {
            return repondre(
                `⏳ *NEXUS-AI is temporarily busy.*\n\n` +
                `Please try again in a moment.`
            );
        }

        if (error?.response?.status >= 500) {
            return repondre(
                `❌ *YouTube download service is currently unavailable.*\n\n` +
                `Please try again later.`
            );
        }

        return repondre(
            `╭━━〔 ❌ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *DOWNLOAD ERROR*\n` +
            `┃\n` +
            `┃  The audio could not be downloaded.\n` +
            `┃\n` +
            `┃  • Check the link\n` +
            `┃  • Try again later\n` +
            `┃  • The API may be unavailable\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
});
