const util = require('util');
const fs = require('fs-extra');
const axios = require('axios');
const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

moment.tz.setDefault(`${conf.TZ}`);

const getTimeAndDate = () => {
    return {
        time: moment().format('HH:mm:ss'),
        date: moment().format('DD/MM/YYYY')
    };
};

zokou({ nomCom: "alive", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre } = commandeOptions;
    const { time, date } = getTimeAndDate();

    // Uptime
    let uptimeSec = process.uptime();
    let hours = Math.floor(uptimeSec / 3600);
    let minutes = Math.floor((uptimeSec % 3600) / 60);
    let seconds = Math.floor(uptimeSec % 60);

    try {
        let text = `*${conf.BOT || "NEXUS-XMD"} IS ALIVE!* ✅\n\n`;
        text += `> Bot : ${conf.BOT || "Online"}\n`;
        text += `> Owner : ${conf.OWNER_NAME || "Owner"}\n`;
        text += `> Time : ${time}\n`;
        text += `> Date : ${date}\n`;
        text += `> Uptime : ${hours}h ${minutes}m ${seconds}s\n`;
        text += `> Platform : ${os.hostname()}\n`;
        text += `> Mode : ${conf.MODE || "public"}\n`;
        text += `> Ram : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n\n`;
        text += `_Running smoothly without errors_`;

        await zk.sendMessage(dest, {
            text: text
        }, { quoted: ms });

    } catch (e) {
        console.log("❌ Alive Command Error: " + e);
        repondre("❌ Error: " + e);
    }
});
