const { zokou } = require("../framework/zokou");
const axios = require("axios");
const yts = require('yt-search');
const fs = require('fs');
const yt = require("../framework/dl/ytdl-core.js");
const ffmpeg = require("fluent-ffmpeg");

zokou({
  nomCom: "mygroups",
  categorie: "User",
  reaction: "💿"
}, async (senn, zk, commandeOptions) => {
  const { repondre } = commandeOptions;

  try {
    const getGroupzs = await zk.groupFetchAllParticipating();
    const groupzs = Object.entries(getGroupzs).map(entry => entry[1]);
    const anaa = groupzs.map(v => v.id);
    let jackhuh = `*GROUPS AM IN*\n\n`;

    repondre(`You are currently in ${anaa.length} groups,ᴘᴏᴘᴋɪᴅ ᴛᴇᴄʜ 👻 will send that list in a moment...`);

    for (const i of anaa) {
      const metadat = await zk.groupMetadata(i);
      jackhuh += `*GROUP NAME:* ${metadat.subject}\n`;
      jackhuh += `*MEMBERS:* ${metadat.participants.length}\n`;
      jackhuh += `*GROUP ID:* ${i}\n\n"> ʙᴜᴍʙʟᴇʙᴇᴇ-xᴍᴅ ᴛᴇᴄʜ 👻`;
    }
    
    await repondre(jackhuh);
  } catch (error) {
    console.error("Error fetching groups:", error);
    repondre("An error occurred while fetching groups.");
  }
});

const fetchAPI = async (url, repondre) => {
  try {
    const response = await axios.get(url);
    await repondre(response.data.result);
  } catch (error) {
    console.error("Error fetching data:", error);
    repondre("An error occurred while fetching data.");
  }
};
