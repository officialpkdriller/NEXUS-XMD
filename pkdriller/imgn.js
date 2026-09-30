const axios = require("axios");
const { zokou } = require("../framework/zokou");

// ─────────────────────────────────────────────
// NEXUS-AI IMAGE GENERATOR
// ─────────────────────────────────────────────

const IMAGE_SERVICE =
  "https://image.pollinations.ai/prompt/";

const MAX_PROMPT_LENGTH = 800;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

zokou(
  {
    nomCom: "imagine",
    aliases: ["img", "image", "gen", "draw"],
    desc: "Generate an image from a text prompt.",
    categorie: "AI",
    reaction: "🎨"
  },

  async (dest, zk, commandeOptions) => {
    const { arg, repondre, ms } = commandeOptions;

    const prompt = Array.isArray(arg)
      ? arg.join(" ").trim()
      : String(arg || "").trim();

    // ─────────────────────────────────────────
    // PROMPT CHECK
    // ─────────────────────────────────────────

    if (!prompt) {
      return repondre(
        `╭━━━〔 🎨 NEXUS-AI IMAGINE 〕━━━╮
┃
┃ ❌ Please provide an image prompt.
┃
┃ Example:
┃ .imagine a futuristic NEXUS-AI logo
┃ with glowing blue neon effects
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ─────────────────────────────────────────
    // PROMPT LENGTH CHECK
    // ─────────────────────────────────────────

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return repondre(
        `╭━━━〔 ⚠️ NEXUS-AI 〕━━━╮
┃
┃ Your prompt is too long.
┃
┃ Maximum:
┃ ${MAX_PROMPT_LENGTH} characters
┃
┃ Current:
┃ ${prompt.length} characters
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ─────────────────────────────────────────
    // GENERATION NOTICE
    // ─────────────────────────────────────────

    await repondre(
      `╭━━━〔 🎨 NEXUS-AI 〕━━━╮
┃
┃ ✦ Generating your image...
┃
┃ ⏳ Please wait while NEXUS-AI
┃    creates your artwork.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );

    try {
      // ───────────────────────────────────────
      // IMAGE API REQUEST
      // ───────────────────────────────────────

      const endpoint =
        `${IMAGE_SERVICE}${encodeURIComponent(prompt)}`;

      const response = await axios.get(endpoint, {
        params: {
          width: 1024,
          height: 1024,
          nologo: true,
          safe: true
        },

        responseType: "arraybuffer",

        timeout: 60000,

        maxContentLength: MAX_IMAGE_BYTES,

        maxBodyLength: MAX_IMAGE_BYTES,

        headers: {
          "User-Agent":
            "NEXUS-AI Image Generator/1.0"
        }
      });

      // ───────────────────────────────────────
      // RESPONSE VALIDATION
      // ───────────────────────────────────────

      const contentType = String(
        response.headers["content-type"] || ""
      ).toLowerCase();

      const buffer = Buffer.from(response.data);

      if (
        !contentType.includes("image/") ||
        !buffer.length
      ) {
        throw new Error(
          "The image service returned an invalid image."
        );
      }

      // ───────────────────────────────────────
      // SEND GENERATED IMAGE
      // ───────────────────────────────────────

      await zk.sendMessage(
        dest,
        {
          image: buffer,

          caption:
            `╭━━━〔 🎨 NEXUS-AI ART 〕━━━╮
┃
┃ ✦ Generated successfully
┃
┃ 📝 Prompt:
┃ ${prompt}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> NEXUS-AI • AI Image Generator`
        },
        {
          quoted: ms
        }
      );

    } catch (error) {
      console.error(
        "[NEXUS-AI IMAGE]",
        error.response?.status ||
        error.message ||
        error
      );

      return repondre(
        `╭━━━〔 ❌ NEXUS-AI 〕━━━╮
┃
┃ Image generation failed.
┃
┃ The image service may be
┃ temporarily unavailable or
┃ the request may have timed out.
┃
┃ Try using a shorter prompt.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
  }
);
