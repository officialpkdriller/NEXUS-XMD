const { zokou } = require("../framework/zokou");
const axios = require("axios");

// ─────────────────────────────────────────────
// NEXUS-AI GPT COMMAND
// ─────────────────────────────────────────────

const messageDelay = 8000; // 8 seconds
let lastTextTime = 0;

zokou(
  {
    nomCom: "gpt",
    aliases: ["gpt4", "ai"],
    categorie: "AI",
    reaction: "🧠",
    desc: "Chat with NEXUS-AI using GPT"
  },

  async (dest, zk, commandeOptions) => {
    const {
      ms,
      arg,
      repondre,
      auteurMessage
    } = commandeOptions;

    const query = arg.join(" ").trim();

    // ─────────────────────────────────────────
    // CHECK USER INPUT
    // ─────────────────────────────────────────

    if (!query) {
      return repondre(
        `╭━━━〔 🧠 NEXUS-AI GPT 〕━━━╮
┃
┃  ❯ Please provide a message.
┃
┃  Example:
┃  ❯ .gpt Hello NEXUS-AI
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ─────────────────────────────────────────
    // RATE LIMIT
    // ─────────────────────────────────────────

    const currentTime = Date.now();

    if (currentTime - lastTextTime < messageDelay) {
      const remaining = Math.ceil(
        (messageDelay - (currentTime - lastTextTime)) / 1000
      );

      return repondre(
        `╭━━━〔 ⏳ NEXUS-AI 〕━━━╮
┃
┃  Please wait ${remaining}s
┃  before sending another
┃  GPT request.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ─────────────────────────────────────────
    // PROCESS REQUEST
    // ─────────────────────────────────────────

    try {
      const response = await axios.get(
        "https://apis-keith.vercel.app/ai/gpt",
        {
          params: {
            q: query
          },
          timeout: 10000
        }
      );

      // ───────────────────────────────────────
      // VALID RESPONSE
      // ───────────────────────────────────────

      if (response.data?.status && response.data?.result) {
        const answer = response.data.result;

        const finalMessage = `╭━━━〔 🧠 NEXUS-AI 〕━━━╮
┃
┃  ✦ GPT RESPONSE
┃
┃  ${answer}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

> Powered by NEXUS-AI`;

        await zk.sendMessage(
          dest,
          {
            text: finalMessage,
            contextInfo: {
              mentionedJid: auteurMessage
                ? [auteurMessage]
                : []
            }
          },
          {
            quoted: ms
          }
        );

        // Update cooldown only after
        // a successful AI response.
        lastTextTime = currentTime;

      } else {
        return repondre(
          `╭━━━〔 ⚠️ NEXUS-AI 〕━━━╮
┃
┃  The AI returned an
┃  invalid response.
┃
┃  Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

    } catch (error) {
      console.error(
        "NEXUS-AI GPT Error:",
        error.message || error
      );

      return repondre(
        `╭━━━〔 ❌ NEXUS-AI 〕━━━╮
┃
┃  Unable to process your
┃  GPT request right now.
┃
┃  Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
  }
);
