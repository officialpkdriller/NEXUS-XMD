const { zokou } = require("../framework/zokou")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien")
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot")
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');


zokou({ 
    nomCom: "kickall", 
    categorie: 'Group', 
    reaction: "👢" 
}, async (dest, zk, commandeOptions) => {

    const { 
        ms, 
        repondre, 
        verifGroupe, 
        nomGroupe, 
        infosGroupe, 
        verifAdmin, 
        superUser 
    } = commandeOptions;

    if (!verifGroupe) { 
        repondre(" thís cσmmαnd ís rєsєrvєd fσr grσups"); 
        return; 
    }

    if (!verifAdmin && !superUser) { 
        repondre("cσmmαnd ís rєsєrvєd fσr αdmíns  σnlч"); 
        return; 
    }

    let allMembers = infosGroupe.participants;
    let botNumber = await zk.user.id.split(':')[0] + '@s.whatsapp.net';
    let isBotAdmin = infosGroupe.participants.find(member => member.id === botNumber)?.admin;

    if (!isBotAdmin && !superUser) {
        return repondre("❌ I need to be an admin to kick members!");
    }

    let confirmMsg = await repondre(`⚠️ *CONFIRMATION NEEDED* ⚠️\n\nAre you sure you want to kick all ${allMembers.length} members from ${nomGroupe}?\n\nType *confirm* to proceed or *cancel* to abort.\n\n⏰ You have 30 seconds to respond.`);

    let collected = await zk.waitForMessage(dest, (msg) => {
        return msg.message?.conversation?.toLowerCase() === 'confirm' || 
               msg.message?.conversation?.toLowerCase() === 'cancel';
    }, 30000).catch(() => null);

    if (!collected || collected.message?.conversation?.toLowerCase() === 'cancel') {
        return repondre("❌ Operation cancelled!");
    }

    let kicked = 0;
    let failed = 0;

    for (const member of allMembers) {
        if (member.admin) continue;
        if (member.id === botNumber) continue;
        
        try {
            await zk.groupParticipantsUpdate(dest, [member.id], "remove");
            kicked++;
        } catch (error) {
            failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let result = `  
┌─────────────────
│ 👢 *KICK ALL COMPLETED* 👢
│
│ *Group :* ${nomGroupe}
│
│ *Results :*
│   ✅ Successfully kicked : ${kicked}
│   ❌ Failed to kick : ${failed}
│   👥 Remaining : ${allMembers.length - kicked - failed}
└─────────────────`;

    await zk.sendMessage(dest, { text: result }, { quoted: ms });

});
