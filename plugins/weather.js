const { zokou } = require("../framework/zokou");
const axios = require("axios");

zokou({
nomCom: "weather",
aliases: ["forecast","temp"],
categorie: "Search",
reaction: "🌤️"
},
async (jid, sock, data) => {

const { arg, ms } = data;

const repondre = async(text)=>{
return sock.sendMessage(jid,{
text,
contextInfo:{
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363288304618280@newsletter",
newsletterName:"NEXUS-AI",
serverMessageId:143
},
externalAdReply:{
title:"🌤️ NEXUS-AI WEATHER",
body:"Weather Information",
thumbnailUrl:"https://files.catbox.moe/wvyd3v.jpg",
sourceUrl:"https://github.com/officialpkdiller/NEXUS-AI",
mediaType:1,
renderLargerThumbnail:false
}
}
},{quoted:ms});
};

try{

if(!arg[0]){
return repondre("❌ Please provide a city name.\nExample: .weather Nairobi");
}

const city = arg.join(" ");

const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);

if(!geo.data.results){
return repondre("❌ City not found.");
}

const place = geo.data.results[0];

const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true`);

const w = weather.data.current_weather;

const message = `🌤️ *Weather for ${place.name}, ${place.country}*

🌡️ Temperature: ${w.temperature}°C
💨 Wind Speed: ${w.windspeed} km/h
🧭 Wind Direction: ${w.winddirection}°
⏰ Time: ${w.time}

Powered by NEXUS-AI`;

await sock.sendMessage(jid,{
text:message,
contextInfo:{
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363288304618280@newsletter",
newsletterName:"NEXUS-AI",
serverMessageId:143
}
}
},{quoted:ms});

}catch(err){

console.log("Weather Error:",err);

repondre("❌ Failed to fetch weather data.");

}

});
