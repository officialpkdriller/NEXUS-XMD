const axios = require("axios");
const yts = require("yt-search");
const { zokou } = require("../framework/zokou");

// =====================================================
//              NEXUS-AI MEDIA DOWNLOADER
//          🎵 PLAY + 🎥 VIDEO IN ONE COMMAND
// =====================================================


// ======================= PLAY ========================
//              .play <song name / URL>
// =====================================================

zokou({
  nomCom: "play",
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, { arg, ms, repondre }) => {

  try {

    if (!arg || !arg[0]) {
      return repondre(
        "❌ *Please provide a song name or YouTube URL.*\n\n" +
        "Example:\n" +
        "`.play Calm Down`\n" +
        "`.play https://youtu.be/xxxxx`"
      );
    }

    const q = arg.join(" ");

    // Search YouTube
    const search = await yts(q);
    const data = search.videos[0];

    if (!data) {
      return repondre("❌ No results found for your search.");
    }

    // Song information
    const desc = `
╭━━━〔 🎵 *NEXUS-AI MUSIC* 〕━━━╮
┃
┃ 🎶 *MUSIC FOUND*
┃
┃ 🎼 *Title:* ${data.title}
┃ ⏱️ *Duration:* ${data.timestamp}
┃ 👁️ *Views:* ${data.views}
┃ 📅 *Uploaded:* ${data.ago}
┃
┃ 🔗 *YouTube:*
┃ ${data.url}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎧 *Downloading your music...*
🤖 *Powered by NEXUS-AI*
`;

    // Send thumbnail
    await zk.sendMessage(
      dest,
      {
        image: { url: data.thumbnail },
        caption: desc
      },
      { quoted: ms }
    );

    // Get audio from API
    const apiRes = await axios.get(
      "https://apiziaul.vercel.app/api/downloader/ytplaymp3",
      {
        params: {
          query: q
        }
      }
    );

    const json = apiRes.data;

    if (
      !json.status ||
      !json.result ||
      !json.result.downloadUrl
    ) {
      return repondre(
        "❌ *Failed to download the audio.*\n" +
        "Please try another song."
      );
    }

    const downloadUrl = json.result.downloadUrl;
    const title = json.result.title || data.title;

    // Send audio
    await zk.sendMessage(
      dest,
      {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg"
      },
      { quoted: ms }
    );

    // Send MP3 document
    await zk.sendMessage(
      dest,
      {
        document: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption:
          "🎵 *NEXUS-AI MUSIC DOWNLOADER*\n\n" +
          "🤖 Powered by *NEXUS-AI*"
      },
      { quoted: ms }
    );

  } catch (e) {

    console.error("PLAY ERROR:", e);

    return repondre(
      "❌ *An error occurred while downloading the music.*\n" +
      "Please try again later."
    );
  }

});


// ====================== VIDEO ========================
//              .video <video name / URL>
// =====================================================

zokou({
  nomCom: "video",
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, { arg, ms, repondre }) => {

  try {

    if (!arg || !arg[0]) {
      return repondre(
        "❌ *Please provide a video name or YouTube URL.*\n\n" +
        "Example:\n" +
        "`.video Despacito`\n" +
        "`.video https://youtu.be/xxxxx`"
      );
    }

    const q = arg.join(" ");

    // Search YouTube
    const search = await yts(q);
    const data = search.videos[0];

    if (!data) {
      return repondre("❌ No results found for your search.");
    }

    // Video information
    const desc = `
╭━━━〔 🎥 *NEXUS-AI VIDEO* 〕━━━╮
┃
┃ 🎬 *VIDEO FOUND*
┃
┃ 📌 *Title:* ${data.title}
┃ ⏱️ *Duration:* ${data.timestamp}
┃ 👁️ *Views:* ${data.views}
┃ 📅 *Uploaded:* ${data.ago}
┃
┃ 🔗 *YouTube:*
┃ ${data.url}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎥 *Downloading your video...*
🤖 *Powered by NEXUS-AI*
`;

    // Send thumbnail
    await zk.sendMessage(
      dest,
      {
        image: { url: data.thumbnail },
        caption: desc
      },
      { quoted: ms }
    );

    // Get video from API
    const apiRes = await axios.get(
      "https://apiziaul.vercel.app/api/downloader/ytmp4",
      {
        params: {
          url: data.url
        }
      }
    );

    const json = apiRes.data;

    if (
      !json.status ||
      !json.result ||
      !json.result.downloadUrl
    ) {
      return repondre(
        "❌ *Failed to download the video.*\n" +
        "The download server may be temporarily unavailable."
      );
    }

    const downloadUrl = json.result.downloadUrl;

    const title =
      json.result.title ||
      json.result.filename ||
      data.title;

    // Send video
    await zk.sendMessage(
      dest,
      {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption:
          `🎥 *NEXUS-AI VIDEO DOWNLOADER*\n\n` +
          `📌 *${title}*\n\n` +
          `🤖 Powered by *NEXUS-AI*`
      },
      { quoted: ms }
    );

    // Send MP4 document
    await zk.sendMessage(
      dest,
      {
        document: { url: downloadUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption:
          "🎥 *NEXUS-AI VIDEO DOWNLOADER*\n\n" +
          "🤖 Powered by *NEXUS-AI*"
      },
      { quoted: ms }
    );

  } catch (e) {

    console.error("VIDEO ERROR:", e);

    return repondre(
      "❌ *An error occurred while downloading the video.*\n" +
      "Please try again later."
    );
  }

});
