const { zokou } = require(__dirname + "/../framework/zokou");

zokou({
  nomCom: "del",
  aliases: ["delete", "d", "clear"],
  categorie: "General"
}, async (dest, zk, commandeOptions) => {

  const { ms, repondre, msgRepondu } = commandeOptions;

  try {
    if (!msgRepondu) {
      return await repondre("❌ Reply to the message you want to delete.");
    }

    // Fix: zokou zingine zina key ndani ya msgRepondu
    const quotedKey = msgRepondu.key || {};
    
    const idToDelete = msgRepondu.id || quotedKey.id;
    const fromMe = msgRepondu.fromMe || quotedKey.fromMe || false;
    const sender = msgRepondu.sender || quotedKey.participant;

    if (!idToDelete) {
      return await repondre("❌ Can't get message ID to delete.");
    }

    const deleteKey = {
      remoteJid: dest,
      fromMe: fromMe,
      id: idToDelete,
      participant: fromMe ? undefined : sender
    };

    await zk.sendMessage(dest, { delete: deleteKey });

  } catch (error) {
    console.log("❌ Del Command Error:", error);
    // Hii ndio ilikuwa inazima bot - sasa tunai-catch
    await repondre(`❌ Failed: ${error.message}`);
  }

});
