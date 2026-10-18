
const { zokou } = require("../framework/zokou");

zokou(
  {
    nomCom: "del",
    aliases: ["delete", "d"],
    categorie: "General",
    reaction: "🗑️"
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    try {
      if (!ms || !ms.message) {
        return repondre("❌ Reply to the message you want to delete.");
      }

      const contextInfo =
        ms.message?.extendedTextMessage?.contextInfo;

      if (!contextInfo?.quotedMessage || !contextInfo?.stanzaId) {
        return repondre("❌ Please reply to a message first.");
      }

      await zk.sendMessage(dest, {
        react: {
          text: "⌛",
          key: ms.key
        }
      }).catch(() => {});

      const quotedParticipant = contextInfo.participant;

      const deleteKey = {
        remoteJid: dest,
        fromMe: false,
        id: contextInfo.stanzaId
      };

      if (quotedParticipant) {
        deleteKey.participant = quotedParticipant;
      }

      await zk.sendMessage(dest, {
        delete: deleteKey
      });

      await zk.sendMessage(dest, {
        react: {
          text: "✅",
          key: ms.key
        }
      }).catch(() => {});

    } catch (error) {
      console.error("NEXUS-AI del command error:", error);

      await zk.sendMessage(dest, {
        react: {
          text: "❌",
          key: ms?.key
        }
      }).catch(() => {});

      return repondre("❌ Failed to delete the message.");
    }
  }
);
```
