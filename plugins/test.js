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

zokou({ nomCom: "test", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre } = commandeOptions;
    const { time, date } = getTimeAndDate();
    const start = Date.now();

    try {
        // Simulate small check
        await new Promise(resolve => setTimeout(resolve, 200));
        const latency = Date.now() - start;

        let text = `*TEST SUCCESSFUL!* ✅\n\n`;
        text += `> Status : Working Fine\n`;
        text += `> Latency : ${latency}ms\n`;
        text += `> Time : ${time}\n`;
        text += `> Date : ${date}\n`;
        text += `> Platform : ${os.platform()}\n`;
        text += `> Node : ${process.version}\n`;
        text += `> Ram : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n\n`;
        text += `_Bot is responding to commands_`;

        await zk.sendMessage(dest, {
            text: text
        }, { quoted: ms });

    } catch (e) {
        console.log("❌ Test Command Error: " + e);
        repondre("❌ Error: " + e);
    }
});
