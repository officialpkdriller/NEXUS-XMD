const { zokou } = require(__dirname + "/../framework/zokou");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

moment.tz.setDefault(conf.TZ);

zokou({ nomCom: "ping", categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const start = Date.now();

    await zk.sendMessage(dest, { text: "🏓 NEXUS-AI is measuring ping..." });

    const ping = Date.now() - start;
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    let status = "🟢 Excellent";
    if (ping > 1000) {
      status = "🔴 Slow";
    } else if (ping > 500) {
      status = "🟡 Moderate";
    }

    const msg = `╭━━〔 *NEXUS-AI PING* 〕━━╮
┃
┃ 🏓 Response: *${ping} ms*
┃ 📡 Status: *${status}*
┃ 📆 Date: *${date}*
┃ 🕒 Time: *${time}*
┃
╰━━━━━━━━━━━━━━━━━━╯

> ⚡ NEXUS-AI is active.
> Powered by PK-Tech`;

    await zk.sendMessage(dest, {
      text: msg
    }, { quoted: ms });

  } catch (e) {
    console.log("❌ Ping Command Error:", e);
    await zk.sendMessage(dest, {
      text: `❌ Ping Error: ${e.message || e}`
    }, { quoted: ms });
  }
});
```
