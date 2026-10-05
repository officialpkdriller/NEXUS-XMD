const { zokou } = require(__dirname + "/../framework/zokou");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

moment.tz.setDefault(conf.TZ);

zokou({
  nomCom: "owner",
  aliases: ["dev", "creator"],
  categorie: "General"
}, async (dest, zk, commandeOptions) => {

  const { ms, repondre } = commandeOptions;

  try {

    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    let msg = `╭─❏ *👑 NEXUS-AI DEVELOPER* \n`;
        msg += `│\n`;
        msg += `│ 👤 Name: *PKDRILLER*\n`;
        msg += `│ 🌍 Country: *Kenya 🇰🇪*\n`;
        msg += `│ 📆 Date: *${date}*\n`;
        msg += `│ 🕒 Time: *${time}*\n`;
        msg += `│\n`;
        msg += `│ 💬 WhatsApp: wa.me/${conf.NUMERO_OWNER}\n`;
        msg += `│ 🌐 GitHub: github.com/officialPkdriller\n`;
        msg += `│\n`;
        msg += `╰───────────────❏`;

    await zk.sendMessage(dest, {
      text: msg
    }, { quoted: ms });

  } catch (e) {
    console.log("❌ Owner Command Error:", e);
    repondre(`❌ Error: ${e}`);
  }

});
