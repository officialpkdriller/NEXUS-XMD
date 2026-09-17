const { zokou } = require("../framework/zokou");
const axios = require("axios");

zokou(
{
nomCom: "ai",
aliases: ["gpt","openai","chatgpt"],
categorie: "AI",
reaction: "🤖"
},
async (jid, sock, data)=>{

const { arg, ms } = data;

const repondre = async(text)=>{
return sock.sendMessage(
jid,
{
text,
contextInfo:{
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363417804135599@newsletter",
newsletterName:"NEXUS-AI",
serverMessageId:143
},
externalAdReply:{
title:"🤖 NEXUS-AI ASSISTANT",
body:"Smart AI System",
thumbnailUrl:"https://files.catbox.moe/wvyd3v.jpg",
sourceUrl:"https://github.com/officialpkdriller/NEXUS-AI",
mediaType:1,
renderLargerThumbnail:false
}
}
},
{quoted:ms}
);
};

if(!arg[0]) return repondre("❌ Please ask a question.");

const question = arg.join(" ");

try{

await repondre("🤖 Thinking...");

// KeylessAI endpoint - no API key needed
const api = "https://keylessai.thryx.workers.dev/v1/chat/completions";

const res = await axios.post(api, {
  model: "gpt-4o",
  messages: [
    { 
      role: "system", 
      content: "You are a very polite and intelligent AI assistant." 
    },
    { 
      role: "user", 
      content: question 
    }
  ]
}, {
  headers: {
    "Content-Type": "application/json"
  }
});

// Extract the response text
const answer = res.data?.choices?.[0]?.message?.content;

if(!answer) return repondre("❌ AI failed to respond.");

await sock.sendMessage(
jid,
{
text:`🤖 *NEXUS-AI RESPONSE*

${answer}`,
contextInfo:{
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363288304618280@newsletter",
newsletterName:"NEXUS-AI",
serverMessageId:143
},
externalAdReply:{
title:"NEXUS AI CHAT",
body:"Ask anything",
thumbnailUrl:"https://files.catbox.moe/vsp16g.jpg",
sourceUrl:"https://github.com/pkdriller0/NEXUS-AI",
mediaType:1,
renderLargerThumbnail:false
}
}
},
{quoted:ms}
);

}catch(err){

console.log("AI Error:",err);

repondre("❌ AI request failed.");

}

}
);
