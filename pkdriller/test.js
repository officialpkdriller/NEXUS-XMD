
const { zokou } = require(__dirname + "/../framework/zokou");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");
const os = require("os");

moment.tz.setDefault(conf.TZ);

zokou({ nomCom: "test", categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const start = Date.now();

    await zk.sendMessage(dest, { text: "🧪 NEXUS-AI system check in progress..." });

    const ping = Date.now() - start;
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    const memory = process.memoryUsage();
    const botRam = (memory.rss / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const uptime = Math.floor(process.uptime());

    const msg = `╭━━〔 *NEXUS-AI SYSTEM TEST* 〕━━╮
┃
┃ 🧪 Test: *Successful*
┃ 🟢 Status: *Operational*
┃ 📡 Ping: *${ping} ms*
┃ 💾 Bot RAM: *${botRam} MB*
┃ 🖥️ Total RAM: *${totalRam} GB*
┃ 📦 Node.js: *${process.version}*
┃ ⏱️ Uptime: *${uptime} seconds*
┃ 📆 Date: *${date}*
┃ 🕒 Time: *${time}*
┃
╰━━━━━━━━━━━━━━━━━━━━╯

> NEXUS-AI diagnostics
> Powered by PK-Tech`;

    await zk.sendMessage(dest, {
      text: msg
    }, { quoted: ms });

  } catch (e) {
    console.log("❌ Test Command Error:", e);
    await zk.sendMessage(dest, {
      text: `❌ Test Error: ${e.message || e}`
    }, { quoted: ms });
  }
});
```
