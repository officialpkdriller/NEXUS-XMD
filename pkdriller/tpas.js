
const os = require("os");
const { zokou } = require("../framework/zokou");

const BOT_NAME = "NEXUS-AI";
const OWNER = "PK-Tech";

// Format bot uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// PING COMMAND
zokou({
    nomCom: "ping",
    aliases: ["pong"],
    categorie: "General",
    reaction: "🏓",
    desc: "Check NEXUS-AI response time"
}, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const start = Date.now();

    const sent = await zk.sendMessage(dest, {
        text: "🏓 *NEXUS-AI is responding...*"
    }, { quoted: ms });

    const latency = Date.now() - start;

    return zk.sendMessage(dest, {
        text: `┌───「 NEXUS PING 」
│
│  Status   : Online
│  Latency  : ${latency} ms
│  Runtime  : ${formatUptime(process.uptime())}
│
└──────────────`
    }, { quoted: ms });
});

// ALIVE COMMAND
zokou({
    nomCom: "alive",
    aliases: ["online"],
    categorie: "General",
    reaction: "💠",
    desc: "Check NEXUS-AI online status"
}, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;

    return zk.sendMessage(dest, {
        text: `┌───「 ${BOT_NAME} 」
│
│  System    : Active
│  Status    : Running
│  Uptime    : ${formatUptime(process.uptime())}
│  Developer : ${OWNER}
│
│  NEXUS-AI is alive and ready.
│
└──────────────`
    }, { quoted: ms });
});

// TEST COMMAND
zokou({
    nomCom: "test",
    aliases: ["check"],
    categorie: "General",
    reaction: "🧪",
    desc: "Test NEXUS-AI system"
}, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const memory = process.memoryUsage();
    const usedMemory = (memory.heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    return zk.sendMessage(dest, {
        text: `┌───「 SYSTEM TEST 」
│
│  Handler  : Working
│  Client   : Connected
│  Node.js  : ${process.version}
│  Memory   : ${usedMemory} MB
│  RAM      : ${totalMemory} GB
│  Platform : ${os.platform()}
│
│  Result   : Passed
│
└──────────────`
    }, { quoted: ms });
});

// SPEED COMMAND
zokou({
    nomCom: "speed",
    aliases: ["latency"],
    categorie: "General",
    reaction: "⚡",
    desc: "Check NEXUS-AI speed"
}, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const start = Date.now();

    try {
        const sent = await zk.sendMessage(dest, {
            text: "⚡ *Measuring NEXUS-AI speed...*"
        }, { quoted: ms });

        const latency = Date.now() - start;

        return zk.sendMessage(dest, {
            text: `┌───「 SPEED TEST 」
│
│  Response : ${latency} ms
│  Status   : Stable
│  Uptime   : ${formatUptime(process.uptime())}
│
└──────────────`
        }, { quoted: ms });
    } catch (error) {
        console.error("NEXUS-AI Speed Error:", error);
        return zk.sendMessage(dest, {
            text: "Unable to measure speed right now.",
        }, { quoted: ms });
    }
});
```
