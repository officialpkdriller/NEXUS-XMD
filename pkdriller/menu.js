const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou(
  {
    nomCom: "menu",
    categorie: "Menu"
  },
  async (jid, sock, ctx) => {
    const { repondre } = ctx;
    const { cm } = require(__dirname + "/../framework/zokou");

    try {
      // =========================
      // GROUP COMMANDS
      // =========================
      const grouped = {};

      cm.forEach((cmd) => {
        const category = cmd.categorie || "Other";

        if (!grouped[category]) {
          grouped[category] = [];
        }

        grouped[category].push(cmd.nomCom);
      });

      // =========================
      // BOT MODE
      // =========================
      const mode =
        String(s.MODE || "").toLowerCase() === "yes"
          ? "PUBLIC"
          : "PRIVATE";

      // =========================
      // PREFIX
      // =========================
      const prefix = s.PREFIX || process.env.PREFIX || ".";

      // =========================
      // DATE & TIME
      // =========================
      const now = moment().tz("Africa/Nairobi");

      const date = now.format("DD/MM/YYYY");
      const time = now.format("HH:mm:ss");

      // =========================
      // MEMORY
      // =========================
      const memory = process.memoryUsage();

      const usedRam = (memory.rss / 1024 / 1024 / 1024).toFixed(2);
      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

      // =========================
      // UPTIME
      // =========================
      const uptime = process.uptime();

      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeText =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // =========================
      // HEADER
      // =========================
      const header = `
╭━━━〔 ✦ 𝐍𝐄𝐗𝐔𝐒-𝐀𝐈 ✦ 〕━━━╮
┃
┃  👑 *OWNER*     : ${s.OWNER_NAME || "Unknown"}
┃  ⚡ *PREFIX*    : [ ${prefix} ]
┃  🌐 *MODE*      : ${mode}
┃  💾 *RAM*       : ${usedRam} / ${totalRam} GB
┃  ⏱️ *UPTIME*    : ${uptimeText}
┃  📅 *DATE*      : ${date}
┃  🕐 *TIME*      : ${time}
┃  🖥️ *PLATFORM*  : ${os.platform()}
┃
┃  🤖 *BOT*       : NEXUS-AI
┃  👨‍💻 *CREATOR*   : PK Driller
┃  📚 *COMMANDS*  : ${cm.length}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      // =========================
      // COMMAND LIST
      // =========================
      let body = `
╭━━〔 ✨ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ✨ 〕━━╮
`;

      for (const category of Object.keys(grouped).sort()) {
        body += `
┃
┃  ◈ *${category.toUpperCase()}*
┃
`;

        grouped[category].forEach((command) => {
          body += `┃  ❯ ${prefix}${command}\n`;
        });
      }

      body += `
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      // =========================
      // FOOTER
      // =========================
      const footer = `
╭━━〔 💎 𝐍𝐄𝐗𝐔𝐒-𝐀𝐈 〕━━╮
┃
┃  ⚡ Fast • Stable • Powerful
┃  🚀 Powered by *PK Driller*
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      // =========================
      // SEND MENU
      // =========================
      await sock.sendMessage(jid, {
        image: {
          url: "https://files.catbox.moe/u4rqiq.jpg"
        },
        caption: header + body + footer,
        contextInfo: {
          mentionedJid: [sock.user.id],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363417804135599@newsletter",
            newsletterName: "NEXUS-AI",
            serverMessageId: -1
          }
        }
      });

    } catch (err) {
      console.error("Menu error:", err);
      repondre(`❌ Menu error: ${err.message || err}`);
    }
  }
);
