const { zokou } = require("../framework/zokou");
const conf = require("../set");

// ═══════════════════════════════════════════════════════════
//                  NEXUS-AI • BUG REPORT
// ═══════════════════════════════════════════════════════════

function normalizeJid(value) {
    const raw = String(value || "").trim();

    if (!raw) return "";

    if (raw.includes("@")) {
        return raw.replace(/:.*(?=@)/, "");
    }

    const number = raw.replace(/\D/g, "");

    if (!number) return "";

    return `${number}@s.whatsapp.net`;
}

function getSenderJid(options, dest) {
    return normalizeJid(
        options.auteurMessage ||
        options.ms?.key?.participant ||
        options.ms?.key?.remoteJid ||
        dest
    );
}

zokou({
    nomCom: "reportbug",
    aliases: ["bugreport", "bug"],
    categorie: "Bug",
    reaction: "📝",
    desc: "Send a bug report directly to the NEXUS-AI owner"
}, async (dest, zk, commandeOptions) => {

    const {
        repondre,
        arg,
        ms
    } = commandeOptions;

    // ═══════════════════════════════════════════════════
    // Bug details
    // ═══════════════════════════════════════════════════

    const details = String(
        Array.isArray(arg)
            ? arg.join(" ")
            : arg || ""
    )
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 700);

    if (!details) {
        return repondre(
            `╭━━〔 📝 NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *BUG REPORT*\n` +
            `┃\n` +
            `┃  Describe the problem you\n` +
            `┃  encountered with the bot.\n` +
            `┃\n` +
            `┃  Example:\n` +
            `┃  .reportbug .play is not working\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }

    // ═══════════════════════════════════════════════════
    // Owner JID
    // ═══════════════════════════════════════════════════

    const ownerJid = normalizeJid(
        conf.NUMERO_OWNER || "254799056874"
    );

    const sender = getSenderJid(
        commandeOptions,
        dest
    );

    if (!ownerJid) {
        return repondre(
            `❌ *NEXUS-AI configuration error.*\n\n` +
            `The owner number is not configured.`
        );
    }

    if (!sender) {
        return repondre(
            `❌ *Unable to identify the report sender.*`
        );
    }

    try {

        // ═══════════════════════════════════════════════════
        // Send report to owner
        // ═══════════════════════════════════════════════════

        const reportMessage = [
            "╭━━〔 📝 NEXUS-AI BUG REPORT 〕━━╮",
            "┃",
            `┃ 👤 *From:* ${sender}`,
            `┃ 💬 *Chat:* ${String(dest || "").slice(0, 120)}`,
            "┃",
            "┃ 📋 *Details:*",
            `┃ ${details}`,
            "┃",
            "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
        ].join("\n");

        await zk.sendMessage(ownerJid, {
            text: reportMessage
        });

        // ═══════════════════════════════════════════════════
        // Confirmation
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(dest, {
            react: {
                text: "✅",
                key: ms.key
            }
        });

        return repondre(
            `╭━━〔 ✅ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *REPORT SENT*\n` +
            `┃\n` +
            `┃  Your bug report has been\n` +
            `┃  delivered to the developer.\n` +
            `┃\n` +
            `┃  Thank you for helping\n` +
            `┃  improve NEXUS-AI. 🚀\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );

    } catch (error) {

        console.error(
            "[NEXUS-AI reportbug]",
            error?.message || error
        );

        try {
            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });
        } catch {}

        return repondre(
            `╭━━〔 ❌ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *REPORT FAILED*\n` +
            `┃\n` +
            `┃  The bug report could not\n` +
            `┃  be delivered right now.\n` +
            `┃\n` +
            `┃  Please try again later.\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
});
