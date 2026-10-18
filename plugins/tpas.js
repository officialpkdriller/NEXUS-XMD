
const os = require("os");
const { zokou } = require("../framework/zokou");

// ═══════════════════════════════════════
//          NEXUS-AI SYSTEM TOOLS
//             Powered by PK-Tech
// ═══════════════════════════════════════

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// ───────────────────────────────────────
// PING COMMAND
// ───────────────────────────────────────

zokou(
    {
        nomCom: "ping",
        categorie: "General"
    },
    async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        const start = Date.now();

        await repondre("⏳ *NEXUS-AI is measuring network response...*");

        const latency = Date.now() - start;

        return repondre(
            `╭━━〔 *NEXUS-AI PING* 〕━━╮
┃
┃  ⚡ *Response:* ${latency} ms
┃  🟢 *Status:* Online
┃  🤖 *Engine:* NEXUS-AI
┃
╰━━━━━━━━━━━━━━━━━━╯

> Powered by PK-Tech`
        );
    }
);

// ───────────────────────────────────────
// ALIVE COMMAND
// ───────────────────────────────────────

zokou(
    {
        nomCom: "alive",
        categorie: "General"
    },
    async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        const now = new Date();
        const date = now.toLocaleDateString("en-GB", {
            timeZone: "Africa/Nairobi"
        });
        const time = now.toLocaleTimeString("en-GB", {
            timeZone: "Africa/Nairobi",
            hour12: false
        });

        const mode = process.env.MODE || "public";

        return repondre(
            `╭━━〔 *NEXUS-AI* 〕━━╮
┃
┃  ✨ *System:* Active
┃  🟢 *Status:* Running
┃  👑 *Developer:* PK-Tech
┃  🌐 *Mode:* ${mode}
┃  📅 *Date:* ${date}
┃  🕒 *Time:* ${time}
┃  ⏱️ *Uptime:* ${formatUptime(process.uptime())}
┃
╰━━━━━━━━━━━━━━━━━━╯

> Your WhatsApp assistant is ready.
> Powered by PK-Tech`
        );
    }
);

// ───────────────────────────────────────
// TEST COMMAND
// ───────────────────────────────────────

zokou(
    {
        nomCom: "test",
        categorie: "General"
    },
    async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        const memory = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        return repondre(
            `╭━━〔 *NEXUS-AI DIAGNOSTICS* 〕━━╮
┃
┃  🧪 *System Test:* Passed
┃  🟢 *Runtime:* Operational
┃  💾 *Bot RAM:* ${(memory.rss / 1024 / 1024).toFixed(2)} MB
┃  🖥️ *System RAM:* ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB used
┃  📦 *Node.js:* ${process.version}
┃  ⚙️ *Platform:* ${os.platform()}
┃  ⏱️ *Uptime:* ${formatUptime(process.uptime())}
┃
╰━━━━━━━━━━━━━━━━━━╯

> NEXUS-AI system check complete.`
        );
    }
);

// ───────────────────────────────────────
// SPEED COMMAND
// ───────────────────────────────────────

zokou(
    {
        nomCom: "speed",
        categorie: "General"
    },
    async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        const start = Date.now();

        await repondre("⚡ *NEXUS-AI is checking performance...*");

        const elapsed = Date.now() - start;

        return repondre(
            `╭━━〔 *NEXUS-AI SPEED* 〕━━╮
┃
┃  🚀 *Response Time:* ${elapsed} ms
┃  ⚡ *Performance:* Active
┃  🟢 *Connection:* Ready
┃  ⏱️ *Uptime:* ${formatUptime(process.uptime())}
┃
╰━━━━━━━━━━━━━━━━━━╯

> NEXUS-AI performance monitor
> Powered by PK-Tech`
        );
    }
);
```
