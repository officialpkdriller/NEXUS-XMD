const { zokou } = require("../framework/zokou")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien")
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot")
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');


zokou({ 
    nomCom: "invite", 
    categorie: 'Group', 
    reaction: "🔗" 
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

    try {
        let inviteCode = await zk.groupInviteCode(dest);
        let inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        let botNumber = await zk.user.id.split(':')[0] + '@s.whatsapp.net';
        let isBotAdmin = infosGroupe.participants.find(member => member.id === botNumber)?.admin;

        if (!isBotAdmin && !superUser) {
            return repondre("❌ I need to be an admin to generate invite links!");
        }

        let tag = `  
┌─────────────────
│ 🔗 *GROUP INVITE LINK* 🔗
│
│ *Group :* ${nomGroupe}
│ *Group ID :* ${dest}
│ *Total Members :* ${infosGroupe.participants.length}
│
│ *Invite Link :*
│ ${inviteLink}
│
│ ⚠️ *Note :*
│ • This link expires in 72 hours
│ • Only admins can reset the link
│ • Share with trusted people only
│
│ 🔄 Use .resetinvite to generate a new link
└─────────────────`;

        let groupIcon = await zk.profilePictureUrl(dest, 'image').catch(() => null);
        
        if (groupIcon) {
            await zk.sendMessage(dest, { 
                image: { url: groupIcon }, 
                caption: tag 
            }, { quoted: ms });
        } else {
            await zk.sendMessage(dest, { text: tag }, { quoted: ms });
        }
        
    } catch (error) {
        repondre(`❌ Failed to generate invite link!\n\nError: ${error.message}`);
    }
});

zokou({ 
    nomCom: "resetinvite", 
    categorie: 'Group', 
    reaction: "🔄" 
}, async (dest, zk, commandeOptions) => {

    const { 
        ms, 
        repondre, 
        verifGroupe, 
        nomGroupe, 
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

    try {
        await zk.groupRevokeInvite(dest);
        
        let newInviteCode = await zk.groupInviteCode(dest);
        let newInviteLink = `https://chat.whatsapp.com/${newInviteCode}`;

        let tag = `  
┌─────────────────
│ 🔄 *INVITE LINK RESET* 🔄
│
│ *Group :* ${nomGroupe}
│ *Reset by :* ${superUser ? 'Owner' : 'Admin'}
│
│ *New Invite Link :*
│ ${newInviteLink}
│
│ ✅ Old link has been revoked
│ ⚠️ Share the new link with members
└─────────────────`;

        await zk.sendMessage(dest, { text: tag }, { quoted: ms });
        
    } catch (error) {
        repondre(`❌ Failed to reset invite link!\n\nError: ${error.message}`);
    }
});
