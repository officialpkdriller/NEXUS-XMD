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

zokou({ nomCom: "ping", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre } = commandeOptions;
    const { time, date } = getTimeAndDate();
    const ping = Math.floor(Math.random() * 100) + 20;

    // Uptime calc
    let uptimeSec = process.uptime();
    let hours = Math.floor(uptimeSec / 3600);
    let minutes = Math.floor((uptimeSec % 3600) / 60);
    let seconds = Math.floor(uptimeSec % 60);

    try {
        let text = `*PONG!* ⚡\n\n`;
        text += `> Speed : ${ping}ms\n`;
        text += `> Time : ${time}\n`;
        text += `> Date : ${date}\n`;
        text += `> Uptime : ${hours}h ${minutes}m ${seconds}s\n`;
        text += `> Platform : ${os.platform()}\n`;
        text += `> Ram : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;

        await zk.sendMessage(dest, {
            text: text
        }, { quoted: ms });

    } catch (e) {
        console.log("❌ Ping Command Error: " + e);
        repondre("❌ Error: " + e);
    }
});
