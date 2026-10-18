const { zokou } = require("../framework/zokou")
//const { getGroupe } = require("../bdd/groupe")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien")
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot")
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');


zokou({ 
    nomCom: "tagall", 
    categorie: 'Group', 
    reaction: "🔔" 
}, async (dest, zk, commandeOptions) => {

    const { 
        ms, 
        repondre, 
        arg, 
        verifGroupe, 
        nomGroupe, 
        infosGroupe, 
        nomAuteurMessage, 
        verifAdmin, 
        superUser 
    } = commandeOptions;

    if (!verifGroupe) { 
        repondre(" thís cσmmαnd ís rєsєrvєd fσr grσups"); 
        return; 
    }

    if (!verifAdmin && !superUser) { 
        repondre("cσmmαnd ís rєsєrvєd fσr grσups"); 
        return; 
    }

    let mess = arg && arg !== ' ' ? arg.join(' ') : 'Aucun Message';
    let allMembers = infosGroupe.participants;

    let tag = `  
┌─────────────────
│ *Group :* ${nomGroupe}
│ *Hey :* ${nomAuteurMessage}
│ *Message :* *${mess}*
│ *Total :* ${allMembers.length} members
└─────────────────

`;

    let emoji = ['👥', '🔔', '📢', '⚡', '💬', '🎯'];
    let random = Math.floor(Math.random() * emoji.length);

    for (const membre of allMembers) {
        tag += `  ${emoji[random]} @${membre.id.split("@")[0]}\n`;
    }

    tag += `\n└─────────────────`;

    await zk.sendMessage(dest, { 
        text: tag, 
        mentions: allMembers.map(i => i.id) 
    }, { quoted: ms });

});
