const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "add",
  categorie: "Group",
  reaction: "➕",
  desc: "Add a user to the group using phone number",
  fromMe: true
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe, verifAdmin, nomGroupe, auteurMessage } = commandeOptions;

  // Check if command is used in a group
  if (!verifGroupe) {
    return repondre("❌ *This command can only be used in groups!*");
  }

  // Check if user is admin
  if (!verifAdmin) {
    return repondre("❌ *Only group admins can add members!*");
  }

  // Check if number is provided
  if (!arg[0]) {
    return repondre("❌ *Please provide a phone number.*\n\nExample: `.add 254693629079`\n\n_Powered by pk_");
  }

  // Clean the phone number (remove any non-numeric characters)
  let phoneNumber = arg[0].replace(/[^0-9]/g, '');
  
  // Remove leading zero if present (Tanzania format)
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.substring(1);
  }
  
  // Ensure it has country code (assume 255 for Tanzania if not present)
  if (!phoneNumber.startsWith('254') && phoneNumber.length === 9) {
    phoneNumber = '254' + phoneNumber;
  }

  // Create JID
  const userJid = phoneNumber + "@s.whatsapp.net";

  // Send initial message
  await repondre(`⏳ *Trying to add ${phoneNumber} to the group...*`);

  try {
    // Try to add the user to the group
    const response = await zk.groupParticipantsUpdate(
      dest,
      [userJid],
      "add"  // "add" action
    );

    console.log("Add response:", response);

    // Check the response
    if (response && response[0]) {
      const status = response[0].status;
      
      if (status === '200') {
        // Success
        let successMsg = `✅ *Successfully added @${phoneNumber} to the group!*\n\n`;
        successMsg += `📱 *Number:* ${phoneNumber}\n`;
        successMsg += `👥 *Group:* ${nomGroupe || 'Unknown'}\n\n`;
        successMsg += `_Powered by pk_`;
        
        await zk.sendMessage(dest, { 
          text: successMsg,
          mentions: [userJid]
        });
        
      } else if (status === '408') {
        // User needs to be invited (privacy settings)
        let inviteMsg = `⚠️ *Cannot add @${phoneNumber} directly.*\n\n`;
        inviteMsg += `*Reason:* User's privacy settings don't allow direct adds.\n\n`;
        inviteMsg += `*Solution:* Send them this invite link or ask them to change privacy settings.\n\n`;
        inviteMsg += `_Powered by pk_`;
        
        await repondre(inviteMsg);
        
        // Generate and send group invite link
        try {
          const inviteCode = await zk.groupInviteCode(dest);
          const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
          
          await zk.sendMessage(dest, {
            text: `🔗 *Group Invite Link:*\n${inviteLink}\n\n_Powered by pk_`
          });
          
        } catch (inviteError) {
          console.log("Failed to get invite link:", inviteError);
        }
        
      } else if (status === '409') {
        // User already in group
        await repondre(`ℹ️ *@${phoneNumber} is already in the group!*\n\n_Powered by Rahmany_`);
        
      } else if (status === '403') {
        // Bot doesn't have permission
        await repondre(`❌ *Failed to add user.*\n\nReason: Bot doesn't have admin permissions to add members.\n\n_Powered by Rahmany_`);
        
      } else {
        // Other error
        await repondre(`❌ *Failed to add user.*\nStatus: ${status}\n\nPlease try again or add manually.\n\n_Powered by Rahmany_`);
      }
    } else {
      await repondre("❌ *Failed to add user. Unknown response.*\n\n_Powered by Rahmany_");
    }

  } catch (error) {
    console.error("Add command error:", error);
    
    // Handle specific errors
    if (error.message.includes('not-authorized')) {
      await repondre("❌ *Bot is not authorized to add members.*\n\nMake sure the bot is a group admin.\n\n_Powered by Rahmany_");
      
    } else if (error.message.includes('participant')) {
      await repondre("❌ *Invalid phone number or user doesn't have WhatsApp.*\n\n_Powered by Rahmany_");
      
    } else {
      await repondre(`❌ *Error adding user:* ${error.message}\n\n_Powered by Rahmany_`);
    }
  }
});
