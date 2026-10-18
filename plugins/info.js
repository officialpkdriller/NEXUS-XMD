const { zokou } = require("../framework/zokou")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien")
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot")
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');


zokou({ 
    nomCom: "groupinfo", 
    categorie: 'Group', 
    reaction: "ℹ️" 
}, async (dest, zk, commandeOptions) => {

    const { 
        ms, 
        repondre, 
        verifGroupe, 
        nomGroupe, 
        infosGroupe, 
        superUser 
    } = commandeOptions;

    if (!verifGroupe) { 
        repondre(" thís cσmmαnd ís rєsєrvєd fσr grσups"); 
        return; 
    }

    let allMembers = infosGroupe.participants;
    let admins = allMembers.filter(membre => membre.admin);
    let members = allMembers.filter(membre => !membre.admin);
    let groupIcon = await zk.profilePictureUrl(dest, 'image').catch(() => null);
    let groupDesc = infosGroupe.desc || "No description set";
    let groupCreated = infosGroupe.creation || "Unknown";
    let groupOwner = infosGroupe.owner || "Unknown";

    let tag = `  
┌─────────────────────────────────
│ ℹ️ *GROUP INFORMATION* ℹ️
│
│ *Name :* ${nomGroupe}
│ *ID :* ${infosGroupe.id}
│ *Description :* ${groupDesc}
│
│ *Statistics :*
│   👥 Total Members : ${allMembers.length}
│   👑 Admins : ${admins.length}
│   👤 Regular Members : ${members.length}
│
│ *Owner :* ${groupOwner}
│ *Created :* ${groupCreated}
│
└─────────────────────────────────

    📌 *Group Status :* Active
    🔒 *Privacy :* ${infosGroupe.announce ? 'Announcement Group' : 'Regular Group'}`;

    if (groupIcon) {
        await zk.sendMessage(dest, { 
            image: { url: groupIcon }, 
            caption: tag 
        }, { quoted: ms });
    } else {
        await zk.sendMessage(dest, { text: tag }, { quoted: ms });
    }

});
