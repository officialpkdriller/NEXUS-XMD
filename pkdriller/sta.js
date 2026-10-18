const { zokou } = require("../framework/zokou");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { recordStatus } = require("../lib/statusHistory");
const { getAutoContacts } = require("../lib/autoContacts");
const { resolveLidForStatus } = require("../lib/lidResolver");

const STATUS_JID = "status@broadcast";

zokou({
  nomCom: "tostatus",
  aliases: ["status", "statuspost", "poststatus"],
  categorie: "General",
  reaction: "📢"
}, async (dest, zk, { ms, arg, repondre, superUser, verifGroupe, auteurMessage }) => {
  if (!superUser && !verifGroupe) {
    return repondre(
      "❌ Use this command from a group, or use it privately as the bot owner."
    );
  }

  const statusArgs = parseStatusArguments(arg);
  const text = statusArgs.text;
  const quoted = getQuotedMessage(ms);
  const media = unwrapMessage(quoted);
  const mediaType = detectMediaType(media);
  const mediaMessage = mediaType ? media[`${mediaType}Message`] : null;
  const mediaCaption = String(mediaMessage?.caption || "").trim();

  const caption =
    mediaCaption && text && mediaCaption !== text
      ? `${mediaCaption}\n${text}`
      : text || mediaCaption;

  if (!caption && !mediaType) {
    return repondre(
      "╭━━━〔 📢 NEXUS-AI STATUS 〕━━━╮\n" +
      "┃\n" +
      "┃ 📝 *TEXT STATUS*\n" +
      "┃ .tostatus Your status text\n" +
      "┃ .tostatus blue Your status text\n" +
      "┃\n" +
      "┃ 🎨 *AVAILABLE COLORS*\n" +
      "┃ red, blue, green, purple,\n" +
      "┃ yellow, black, white, orange\n" +
      "┃ You can also use #RRGGBB\n" +
      "┃\n" +
      "┃ 🖼️ *MEDIA STATUS*\n" +
      "┃ Reply to an image, video,\n" +
      "┃ audio, or voice note with:\n" +
      "┃ .tostatus [color] [caption]\n" +
      "┃\n" +
      "╰━━━━━━━━━━━━━━━━━━━━━━╯\n" +
      "🤖 *Powered by NEXUS-AI*"
    );
  }

  try {
    await repondre("⏳ NEXUS-AI is publishing your WhatsApp Status...");

    const statusOptions = await buildStatusOptions(
      zk,
      dest,
      ms,
      auteurMessage
    );

    if (!statusOptions.statusJidList.length) {
      throw new Error(
        "No synced WhatsApp contacts are available for the status audience."
      );
    }

    console.log(
      `[NEXUS-AI Status] Publishing ${mediaType || "text"} status to ${statusOptions.statusJidList.length} recipients`
    );

    let resultKey;

    if (mediaType) {
      const buffer = await downloadMedia(media, mediaType);

      if (!buffer.length) {
        throw new Error("The replied media could not be downloaded.");
      }

      const payload =
        mediaType === "audio"
          ? {
              audio: buffer,
              mimetype:
                mediaMessage.mimetype || "audio/ogg; codecs=opus",
              ptt: Boolean(mediaMessage.ptt),
              ...(caption ? { caption } : {})
            }
          : {
              [mediaType]: buffer,
              ...(caption ? { caption } : {})
            };

      const result = await zk.sendMessage(
        STATUS_JID,
        payload,
        statusOptions
      );

      resultKey = assertStatusAccepted(result);

      recordStatus({
        type: mediaType,
        voiceNote: mediaType === "audio" && Boolean(mediaMessage.ptt),
        captionLength: caption.length
      }).catch((error) =>
        console.error(
          "[NEXUS-AI Status] History record failed:",
          error.message
        )
      );
    } else {
      const result = await zk.sendMessage(
        STATUS_JID,
        { text: caption },
        {
          ...statusOptions,
          backgroundColor: statusArgs.backgroundColor,
          font: statusArgs.font
        }
      );

      resultKey = assertStatusAccepted(result);

      recordStatus({
        type: "text",
        captionLength: caption.length
      }).catch((error) =>
        console.error(
          "[NEXUS-AI Status] History record failed:",
          error.message
        )
      );
    }

    return repondre(
      "╭━━━〔 ✅ NEXUS-AI 〕━━━╮\n" +
      "┃\n" +
      "┃ Status published successfully!\n" +
      `┃ Type: ${mediaType ? mediaType[0].toUpperCase() + mediaType.slice(1) : "Text"}\n` +
      `┃ ID: ${resultKey}\n` +
      "┃\n" +
      "╰━━━━━━━━━━━━━━━━━━━━╯"
    );
  } catch (error) {
    console.error(
      "[NEXUS-AI Status] Publishing failed:",
      error?.message || error
    );

    return repondre(
      "❌ Failed to publish the status. Check the bot session and try again."
    );
  }
});

const STATUS_COLORS = {
  black: "#111827",
  navy: "#172554",
  blue: "#1d4ed8",
  cyan: "#0e7490",
  green: "#166534",
  lime: "#3f6212",
  yellow: "#a16207",
  orange: "#c2410c",
  red: "#b91c1c",
  pink: "#be185d",
  purple: "#6b21a8",
  violet: "#4c1d95",
  brown: "#78350f",
  gray: "#374151",
  grey: "#374151",
  white: "#f8fafc"
};

function parseStatusArguments(args = []) {
  const values = [...args];
  let backgroundColor = "#111827";
  let font = 2;

  const first = String(values[0] || "").toLowerCase();

  const colorMatch = first.match(
    /^(?:--?color=|bg=)(#[0-9a-f]{6}|[a-z]+)$/i
  );

  if (colorMatch) {
    backgroundColor = normalizeStatusColor(colorMatch[1]);
    values.shift();
  } else if (
    first === "color" ||
    first === "--color" ||
    first === "-color"
  ) {
    values.shift();

    if (values[0]) {
      backgroundColor = normalizeStatusColor(values.shift());
    }
  } else if (
    STATUS_COLORS[first] ||
    /^#[0-9a-f]{6}$/i.test(first)
  ) {
    backgroundColor = normalizeStatusColor(values.shift());
  }

  const fontMatch = String(values[0] || "").match(
    /^(?:--?font=)([1-5])$/i
  );

  if (fontMatch) {
    font = Number(fontMatch[1]);
    values.shift();
  }

  return {
    text: values.join(" ").trim(),
    backgroundColor,
    font
  };
}

function normalizeStatusColor(value) {
  const color = String(value || "").trim().toLowerCase();

  return (
    STATUS_COLORS[color] ||
    (/^#[0-9a-f]{6}$/i.test(color) ? color : "#111827")
  );
}

function getQuotedMessage(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    message?.message?.imageMessage?.contextInfo?.quotedMessage ||
    message?.message?.videoMessage?.contextInfo?.quotedMessage ||
    message?.message?.audioMessage?.contextInfo?.quotedMessage ||
    null
  );
}

function unwrapMessage(message) {
  let current = message;

  for (let i = 0; i < 4; i += 1) {
    const wrapper =
      current?.viewOnceMessageV2 ||
      current?.viewOnceMessage ||
      current?.viewOnceMessageV2Extension ||
      current?.documentWithCaptionMessage;

    if (!wrapper?.message) break;

    current = wrapper.message;
  }

  return current;
}

function detectMediaType(message) {
  if (!message || typeof message !== "object") return null;

  if (message.imageMessage) return "image";
  if (message.videoMessage) return "video";
  if (message.audioMessage) return "audio";

  return null;
}

async function buildStatusOptions(client, dest, message, senderJid) {
  const account =
    client?.authState?.creds?.me ||
    client?.creds?.me ||
    {};

  const botJids = [
    client?.user?.id,
    client?.user?.lid,
    client?.user?.jid,
    account.id,
    account.lid
  ]
    .map((jid) => normalizeUserJid(jid, client))
    .filter(Boolean);

  const requesterJid =
    normalizeUserJid(senderJid, client) ||
    normalizeUserJid(message?.key?.participant, client) ||
    normalizeUserJid(dest, client);

  const contactStores = [
    client?.blazeStore?.contacts,
    client?.store?.contacts,
    client?.contacts
  ].filter(
    (contacts) => contacts && typeof contacts === "object"
  );

  const liveContactJids = contactStores
    .flatMap((contacts) => Object.values(contacts))
    .map((contact) =>
      normalizeUserJid(
        contact?.id || contact?.jid || contact,
        client
      )
    )
    .filter(Boolean);

  let persistedContactJids = [];

  try {
    persistedContactJids = (await getAutoContacts())
      .map((contact) =>
        normalizeUserJid(contact?.jid, client)
      )
      .filter(Boolean);
  } catch (error) {
    console.error(
      "[NEXUS-AI Status] Persisted contacts unavailable:",
      error.message || error
    );
  }

  const candidateJids = [
    ...new Set([
      ...botJids,
      ...liveContactJids,
      ...persistedContactJids,
      requesterJid
    ].filter(Boolean))
  ]
    .filter((jid) => jid !== STATUS_JID)
    .filter(
      (jid) =>
        jid.endsWith("@s.whatsapp.net") ||
        jid.endsWith("@lid")
    );

  const statusJidList = [
    ...new Set(
      await Promise.all(
        candidateJids.map((jid) =>
          resolveLidForStatus(client, jid)
        )
      )
    )
  ].filter(Boolean);

  console.log(
    `[NEXUS-AI Status] Resolved status recipients: ${statusJidList.length}`
  );

  return { statusJidList };
}

function assertStatusAccepted(result) {
  if (!result?.key?.id) {
    throw new Error(
      "WhatsApp did not return a status message key."
    );
  }

  return result.key.id;
}

function normalizeUserJid(value, client) {
  if (!value) return null;

  let jid = String(value).trim();

  if (typeof client?.decodeJid === "function") {
    try {
      const decoded = client.decodeJid(jid);
      if (decoded) jid = decoded;
    } catch (_) {}
  }

  jid = jid.replace(/:\d+(?=@)/, "");

  return jid.endsWith("@s.whatsapp.net") ||
    jid.endsWith("@lid")
    ? jid
    : null;
}

async function downloadMedia(message, type) {
  const mediaMessage = message[`${type}Message`];

  const stream = await downloadContentFromMessage(
    mediaMessage,
    type
  );

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
