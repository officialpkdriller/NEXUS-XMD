
const { zokou } = require(__dirname + "/../framework/zokou");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

moment.tz.setDefault(conf.TZ);

zokou({ nomCom: "test", categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const start = Date.now();
    await zk.sendMessage(dest, { text: "⚡ Running test..." });
    const end = Date.now();

    const ping = end - start;
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    let msg = `╭─❏ *NEXUS-AI SYSTEM TEST*\n` +
              `│\n` +
              `│ 📡 Ping: *${ping}ms*\n` +
              `│ 📆 Date: *${date}*\n` +
              `│ 🕒 Time: *${time}*\n` +
              `│\n` +
              `╰───────────────❏`;

    await zk.sendMessage(dest, {
      text: msg
    }, { quoted: ms });

  } catch (e) {
    console.log("❌ Test Command Error:", e);
    await zk.sendMessage(dest, { text: `❌ Error: ${e}` }, { quoted: ms });
  }
});
```
