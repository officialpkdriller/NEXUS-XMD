const { zokou } = require("../framework/zokou");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// ─────────────────────────────────────────────
// NEXUS-AI GROUP STATUS
// ─────────────────────────────────────────────

async function getBuffer(message, type) {
    const stream = await downloadContentFromMessage(message, type);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

// WhatsApp group-status context
function statusContext(sourceType) {
    return {
        isGroupStatus: true,
        statusSourceType: sourceType,
        statusAttributions: [
            {
                type: 10
            }
        ],
        statusAudienceMetadata: {
            audienceType: "CLOSE_FRIENDS"
        }
    };
}

zokou(
    {
        nomCom: "gstatus",
        aliases: ["gs"],
        categorie: "Group",
        reaction: "👥",
        desc: "Post text or media as a group status"
    },

    async (dest, zk, commandeOptions) => {
        const {
            repondre,
            verifGroupe,
            arg,
            ms,
            msgRepondu,
            prefixe
        } = commandeOptions;

        // ─────────────────────────────────────────
        // REACTION HELPER
        // ─────────────────────────────────────────

        const react = (emoji) => {
            return zk.sendMessage(dest, {
                react: {
                    text: emoji,
                    key: ms.key
                }
            }).catch(() => {});
        };

        try {

            // ─────────────────────────────────────
            // READ COMMAND ARGUMENTS
            // ─────────────────────────────────────

            const afterCmd = (arg || [])
                .join(" ")
                .trim();

            let targetGroupJid = null;
            let inlineText = null;

            // ─────────────────────────────────────
            // COMMAND USED INSIDE A GROUP
            // ─────────────────────────────────────

            if (verifGroupe) {

                targetGroupJid = dest;
                inlineText = afterCmd || null;

            } else {

                // ─────────────────────────────────
                // COMMAND USED IN PRIVATE CHAT
                // ─────────────────────────────────

                if (!afterCmd) {
                    await react("❌");

                    return repondre(
                        `╭━━━〔 👥 NEXUS-AI STATUS 〕━━━╮
┃
┃ Reply to an image, video or
┃ audio and provide a group
┃ link or group JID.
┃
┃ Example:
┃ ${prefixe}gstatus <group-link>
┃
┃ Or:
┃ ${prefixe}gstatus 120363@g.us
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
                    );
                }

                const parts = afterCmd.split(/\s+/);

                const input = parts[0];

                const rest = parts
                    .slice(1)
                    .join(" ")
                    .trim();

                // ─────────────────────────────────
                // GROUP INVITE LINK
                // ─────────────────────────────────

                if (input.includes("chat.whatsapp.com")) {

                    let code;

                    try {
                        const url = new URL(input);

                        code = url.pathname
                            .replace(/^\/+/, "");

                    } catch {
                        code = input
                            .split("/")
                            .pop();
                    }

                    try {

                        const result =
                            await zk.groupGetInviteInfo(code);

                        targetGroupJid =
                            result?.id ||
                            result?.groupId ||
                            result?.gid;

                        if (!targetGroupJid) {
                            throw new Error(
                                "Group ID could not be obtained."
                            );
                        }

                    } catch (error) {

                        await react("❌");

                        return repondre(
                            `╭━━━〔 ❌ NEXUS-AI STATUS 〕━━━╮
┃
┃ Invalid or expired group link.
┃
┃ Please check the invite link
┃ and try again.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
                        );
                    }

                // ─────────────────────────────────
                // GROUP JID
                // ─────────────────────────────────

                } else if (input.includes("@g.us")) {

                    targetGroupJid = input.trim();

                } else {

                    await react("❌");

                    return repondre(
                        `╭━━━〔 ❌ NEXUS-AI STATUS 〕━━━╮
┃
┃ Invalid group link or JID.
┃
┃ Supported formats:
┃
┃ • WhatsApp group invite link
┃ • 120363xxxxxxxx@g.us
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
                    );
                }

                inlineText = rest || null;
            }

            // ─────────────────────────────────────
            // PROCESSING
            // ─────────────────────────────────────

            await react("⌛");

            let caption = null;
            let sourceMsg = null;
            let mediaType = null;

            const quoted = msgRepondu;

            // ─────────────────────────────────────
            // DIRECT IMAGE
            // ─────────────────────────────────────

            if (ms.message?.imageMessage) {

                sourceMsg = ms.message.imageMessage;

                mediaType = "image";

                caption =
                    ms.message.imageMessage?.caption ||
                    inlineText ||
                    null;

            // ─────────────────────────────────────
            // DIRECT VIDEO
            // ─────────────────────────────────────

            } else if (ms.message?.videoMessage) {

                sourceMsg = ms.message.videoMessage;

                mediaType = "video";

                caption =
                    ms.message.videoMessage?.caption ||
                    inlineText ||
                    null;

            // ─────────────────────────────────────
            // DIRECT AUDIO
            // ─────────────────────────────────────

            } else if (ms.message?.audioMessage) {

                sourceMsg = ms.message.audioMessage;

                mediaType = "audio";

            // ─────────────────────────────────────
            // REPLIED MESSAGE
            // ─────────────────────────────────────

            } else if (quoted) {

                if (quoted.imageMessage) {

                    sourceMsg = quoted.imageMessage;

                    mediaType = "image";

                    caption =
                        quoted.imageMessage?.caption ||
                        inlineText ||
                        null;

                } else if (quoted.videoMessage) {

                    sourceMsg = quoted.videoMessage;

                    mediaType = "video";

                    caption =
                        quoted.videoMessage?.caption ||
                        inlineText ||
                        null;

                } else if (quoted.audioMessage) {

                    sourceMsg = quoted.audioMessage;

                    mediaType = "audio";

                } else if (quoted.conversation) {

                    caption =
                        quoted.conversation ||
                        inlineText ||
                        null;

                } else if (
                    quoted.extendedTextMessage?.text
                ) {

                    caption =
                        quoted.extendedTextMessage.text ||
                        inlineText ||
                        null;
                }

            } else {

                caption = inlineText || null;
            }

            // ─────────────────────────────────────
            // NOTHING PROVIDED
            // ─────────────────────────────────────

            if (!mediaType && !caption) {

                await react("❌");

                return repondre(
                    `╭━━━〔 👥 NEXUS-AI STATUS 〕━━━╮
┃
┃ Nothing to post.
┃
┃ Reply to:
┃ • 🖼️ Image
┃ • 🎬 Video
┃ • 🎵 Audio
┃ • 📝 Text
┃
┃ Or provide text after the
┃ command.
┃
┃ Example:
┃ ${prefixe}gstatus Hello everyone!
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }

            // ─────────────────────────────────────
            // IMAGE STATUS
            // ─────────────────────────────────────

            if (mediaType === "image") {

                const buffer =
                    await getBuffer(
                        sourceMsg,
                        "image"
                    );

                const messageObj = {
                    image: buffer,
                    contextInfo:
                        statusContext("IMAGE")
                };

                if (caption) {
                    messageObj.caption = caption;
                }

                await zk.sendMessage(
                    targetGroupJid,
                    messageObj
                );

            // ─────────────────────────────────────
            // VIDEO STATUS
            // ─────────────────────────────────────

            } else if (mediaType === "video") {

                const buffer =
                    await getBuffer(
                        sourceMsg,
                        "video"
                    );

                const messageObj = {
                    video: buffer,
                    contextInfo:
                        statusContext("VIDEO")
                };

                if (caption) {
                    messageObj.caption = caption;
                }

                await zk.sendMessage(
                    targetGroupJid,
                    messageObj
                );

            // ─────────────────────────────────────
            // AUDIO STATUS
            // ─────────────────────────────────────

            } else if (mediaType === "audio") {

                const buffer =
                    await getBuffer(
                        sourceMsg,
                        "audio"
                    );

                await zk.sendMessage(
                    targetGroupJid,
                    {
                        audio: buffer,
                        mimetype: "audio/mp4",
                        contextInfo:
                            statusContext("AUDIO")
                    }
                );

            // ─────────────────────────────────────
            // TEXT STATUS
            // ─────────────────────────────────────

            } else {

                await zk.sendMessage(
                    targetGroupJid,
                    {
                        text: caption,
                        contextInfo:
                            statusContext("TEXT")
                    }
                );
            }

            // ─────────────────────────────────────
            // SUCCESS
            // ─────────────────────────────────────

            await react("✅");

            // Only send confirmation when the
            // command was used from a private chat.

            if (!verifGroupe) {

                return repondre(
                    `╭━━━〔 ✅ NEXUS-AI STATUS 〕━━━╮
┃
┃ Status posted successfully.
┃
┃ 👥 Target:
┃ ${targetGroupJid}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }

        } catch (error) {

            console.error(
                "NEXUS-AI GStatus Error:",
                error
            );

            await react("❌");

            return repondre(
                `╭━━━〔 ❌ NEXUS-AI ERROR 〕━━━╮
┃
┃ Failed to post the group
┃ status.
┃
┃ Error:
┃ ${error.message}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }
    }
);
