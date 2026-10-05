const { zokou } = require(__dirname + "/../framework/zokou");

zokou({
  nomCom: "del",
  aliases: ["delete", "d"],
  categorie: "Group"
}, async (dest, zk, commandeOptions) => {

  const { ms, repondre, msgRepondu } = commandeOptions;

  try {
    // Kama huna ms (key ya message yako) na msgRepondu
    if (!ms || !ms.key) {
      return;
    }

    // Lazima u-reply message
    if (!msgRepondu) {
      return repondre("❌ Reply to a message to delete it.");
    }

    // Logic kutoka kwa code uliyonitumia
    const deleteKey = {
      remoteJid: dest,
      fromMe: msgRepondu.fromMe || false,
      id: msgRepondu.id,
      participant: msgRepondu.fromMe ? undefined : msgRepondu.sender
    };

    await zk.sendMessage(dest, { delete: deleteKey });

  } catch (error) {
    console.log("❌ Del Command Error:", error);
    repondre(`❌ Failed to delete: ${error.message}`);
  }

});
