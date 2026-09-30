const { zokou } = require("../framework/zokou");
const pkg = require("@whiskeysockets/baileys");
const { generateWAMessageFromContent, proto } = pkg;
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");

// ═══════════════════════════════════════════════════════════
//                    NEXUS-AI • URL TOOL
// ═══════════════════════════════════════════════════════════

const UPLOAD_API = "https://url.bmbxmd.workers.dev/api/upload";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Generate random 6-character file ID
function generateShortId(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return result;
}

// Get file extension from MIME type
function getExtension(mimeType = "") {
    if (mimeType.includes("image/jpeg")) return ".jpg";
    if (mimeType.includes("image/png")) return ".png";
    if (mimeType.includes("image/webp")) return ".webp";
    if (mimeType.includes("image/gif")) return ".gif";
    if (mimeType.includes("video")) return ".mp4";
    if (mimeType.includes("audio")) return ".mp3";
    if (mimeType.includes("application/pdf")) return ".pdf";

    return ".bin";
}

// Detect media category
function getMediaType(mimeType = "") {
    if (mimeType.includes("image")) return "Image";
    if (mimeType.includes("video")) return "Video";
    if (mimeType.includes("audio")) return "Audio";

    return "File";
}

zokou({
    nomCom: "url",
    aliases: ["tourl", "upload", "geturl"],
    categorie: "General",
    reaction: "🖇️",
    desc: "Convert media files into shareable URLs"
}, async (dest, zk, commandeOptions) => {

    const {
        repondre,
        msgRepondu,
        ms
    } = commandeOptions;

    let mediaBuffer = null;

    try {

        // ═══════════════════════════════════════════════════
        // Detect replied/current media
        // ═══════════════════════════════════════════════════

        const imageMessage =
            msgRepondu?.imageMessage ||
            ms?.message?.imageMessage;

        const videoMessage =
            msgRepondu?.videoMessage ||
            ms?.message?.videoMessage;

        const audioMessage =
            msgRepondu?.audioMessage ||
            ms?.message?.audioMessage;

        const documentMessage =
            msgRepondu?.documentMessage ||
            ms?.message?.documentMessage;

        const mediaMessage =
            imageMessage ||
            videoMessage ||
            audioMessage ||
            documentMessage;

        if (!mediaMessage) {
            return repondre(
                `╭━━〔 🖇️ NEXUS-AI 〕━━╮\n` +
                `┃\n` +
                `┃  *MEDIA → URL*\n` +
                `┃\n` +
                `┃  Reply to any supported\n` +
                `┃  media file with:\n` +
                `┃\n` +
                `┃  • Image\n` +
                `┃  • Video\n` +
                `┃  • Audio\n` +
                `┃  • Document\n` +
                `┃\n` +
                `┃  Example:\n` +
                `┃  .url\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`
            );
        }

        // ═══════════════════════════════════════════════════
        // Processing reaction
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(dest, {
            react: {
                text: "⏳",
                key: ms.key
            }
        });

        // ═══════════════════════════════════════════════════
        // MIME type
        // ═══════════════════════════════════════════════════

        const mimeType =
            mediaMessage.mimetype || "application/octet-stream";

        // ═══════════════════════════════════════════════════
        // Download media
        // ═══════════════════════════════════════════════════

        try {
            mediaBuffer = await zk.downloadAndSaveMediaMessage(
                mediaMessage
            );
        } catch (downloadError) {

            console.error(
                "NEXUS-AI Media Download Error:",
                downloadError
            );

            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });

            return repondre(
                "❌ *Download failed.*\n\nPlease try sending or replying to the media again."
            );
        }

        // ═══════════════════════════════════════════════════
        // Check downloaded file
        // ═══════════════════════════════════════════════════

        if (!mediaBuffer || !fs.existsSync(mediaBuffer)) {
            throw new Error("Downloaded media file was not found.");
        }

        const stats = fs.statSync(mediaBuffer);
        const fileSize = stats.size;

        if (fileSize <= 0) {
            fs.unlinkSync(mediaBuffer);
            mediaBuffer = null;

            return repondre(
                "❌ The media file appears to be empty."
            );
        }

        // ═══════════════════════════════════════════════════
        // 100MB limit
        // ═══════════════════════════════════════════════════

        if (fileSize > MAX_FILE_SIZE) {

            fs.unlinkSync(mediaBuffer);
            mediaBuffer = null;

            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });

            return repondre(
                `❌ *File too large.*\n\n` +
                `Maximum allowed size: *100 MB*\n` +
                `Your file: *${(fileSize / (1024 * 1024)).toFixed(2)} MB*`
            );
        }

        // ═══════════════════════════════════════════════════
        // Generate filename
        // ═══════════════════════════════════════════════════

        const shortId = generateShortId(6);
        const extension = getExtension(mimeType);
        const filename = `${shortId}${extension}`;

        // ═══════════════════════════════════════════════════
        // Prepare upload
        // ═══════════════════════════════════════════════════

        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream(mediaBuffer),
            {
                filename,
                contentType: mimeType
            }
        );

        // ═══════════════════════════════════════════════════
        // Upload
        // ═══════════════════════════════════════════════════

        const response = await axios.post(
            UPLOAD_API,
            form,
            {
                headers: {
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 60000
            }
        );

        // ═══════════════════════════════════════════════════
        // Remove temporary file
        // ═══════════════════════════════════════════════════

        if (mediaBuffer && fs.existsSync(mediaBuffer)) {
            fs.unlinkSync(mediaBuffer);
            mediaBuffer = null;
        }

        const data = response?.data;

        if (!data || !data.url) {
            throw new Error(
                "Upload service did not return a valid URL."
            );
        }

        const mediaUrl = data.url;

        // ═══════════════════════════════════════════════════
        // File information
        // ═══════════════════════════════════════════════════

        const mediaType = getMediaType(mimeType);
        const fileSizeMB = (
            fileSize /
            (1024 * 1024)
        ).toFixed(2);

        // ═══════════════════════════════════════════════════
        // NEXUS-AI result message
        // ═══════════════════════════════════════════════════

        const textMessage =
            `╭━━〔 🖇️ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *UPLOAD COMPLETE*\n` +
            `┃\n` +
            `┃  📁 Type  : ${mediaType}\n` +
            `┃  📦 Size  : ${fileSizeMB} MB\n` +
            `┃  🔑 ID    : ${shortId}\n` +
            `┃\n` +
            `┃  🔗 URL\n` +
            `┃  ${mediaUrl}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯\n` +
            `> ⚡ Powered by NEXUS-AI`;

        // ═══════════════════════════════════════════════════
        // Copy URL button
        // ═══════════════════════════════════════════════════

        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 COPY LINK",
                    copy_code: mediaUrl
                })
            }
        ];

        // ═══════════════════════════════════════════════════
        // Interactive WhatsApp message
        // ═══════════════════════════════════════════════════

        const viewOnceMessage = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },

                    interactiveMessage:
                        proto.Message.InteractiveMessage.create({

                            body:
                                proto.Message.InteractiveMessage.Body.create({
                                    text: textMessage
                                }),

                            footer:
                                proto.Message.InteractiveMessage.Footer.create({
                                    text: "NEXUS-AI • Media Tools"
                                }),

                            header:
                                proto.Message.InteractiveMessage.Header.create({
                                    title: "NEXUS-AI",
                                    subtitle: "Media URL Generator",
                                    hasMediaAttachment: false
                                }),

                            nativeFlowMessage:
                                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    buttons
                                })
                        })
                }
            }
        };

        // ═══════════════════════════════════════════════════
        // Generate and relay message
        // ═══════════════════════════════════════════════════

        const waMsg = generateWAMessageFromContent(
            dest,
            viewOnceMessage,
            {}
        );

        await zk.relayMessage(
            dest,
            waMsg.message,
            {
                messageId: waMsg.key.id
            }
        );

        // ═══════════════════════════════════════════════════
        // Success reaction
        // ═══════════════════════════════════════════════════

        await zk.sendMessage(dest, {
            react: {
                text: "✅",
                key: ms.key
            }
        });

    } catch (error) {

        console.error(
            "NEXUS-AI URL Upload Error:",
            error?.response?.data || error
        );

        // Cleanup temporary file
        try {
            if (
                mediaBuffer &&
                fs.existsSync(mediaBuffer)
            ) {
                fs.unlinkSync(mediaBuffer);
            }
        } catch (cleanupError) {
            console.error(
                "NEXUS-AI Cleanup Error:",
                cleanupError
            );
        }

        // Error reaction
        try {
            await zk.sendMessage(dest, {
                react: {
                    text: "❌",
                    key: ms.key
                }
            });
        } catch {}

        const apiError =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Unknown upload error.";

        return repondre(
            `╭━━〔 ❌ NEXUS-AI 〕━━╮\n` +
            `┃\n` +
            `┃  *UPLOAD FAILED*\n` +
            `┃\n` +
            `┃  ${apiError}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
});
