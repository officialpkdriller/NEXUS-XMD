const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou({
  nomCom: "menu",
  categorie: "Menu"
}, async (jid, sock, ctx) => {
  let { repondre } = ctx;
  let { cm } = require(__dirname + "/../framework/zokou");

  // Group commands
  let grouped = {};
  cm.forEach(cmd => {
    if (!grouped[cmd.categorie]) grouped[cmd.categorie] = [];
    grouped[cmd.categorie].push(cmd.nomCom);
  });

  // Mode
  let mode = (s.MODE.toLowerCase() === "yes") ? "PUBLIC" : "PRIVATE";

  // Date & Time
  moment.tz.setDefault("Africa/Nairobi");
  const date = moment().format("DD/MM/YYYY");
  const time = moment().format("HH:mm:ss");

  // Stylish Header
  let menu = `
╭━〔 *NEXUS-AI* 〕━⬣
│ 👤 Owner : ${s.OWNER_NAME}
│ ⚡ Mode : ${mode}
│ 📅 Date : ${date}
│ ⏰ Time : ${time}
│ 💻 Platform : ${os.platform()}
│ 📊 Commands : ${cm.length}
╰━━━━━━━━━━━━⬣

✨ *Command Categories* 👇
`;

  // Body (modern list style)
  for (let cat in grouped) {
    menu += `\n*╭─ ${cat}*\n`;
    menu += `│ ${grouped[cat].map(c => `➤ ${c}`).join("\n│ ")}\n`;
    menu += `╰────────────\n`;
  }

  // Footer
  menu += `
⚡ _Fast. Smart. Reliable._
🚀 Powered by *Pkdriller*
`;

  try {
    await sock.sendMessage(jid, {
      image: { url: "https://files.catbox.moe/e2rhpu.jpg" },
      caption: menu,
      contextInfo: {
        mentionedJid: [sock.user.id],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363417804135599@newsletter",
          newsletterName: "NEXUS-AI UPDATES",
          serverMessageId: -1
        },
        externalAdReply: {
          title: "NEXUS-AI BOT",
          body: "Modern WhatsApp Bot Menu",
          thumbnailUrl: "https://files.catbox.moe/e2rhpu.jpg",
          sourceUrl: "https://github.com/nexustech1911/NEXUS-XMD",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });

  } catch (e) {
    console.log(e);
    repondre("❌ Menu Error: " + e);
  }
});
