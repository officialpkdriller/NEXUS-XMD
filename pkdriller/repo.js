'use strict';

const { zokou } = require(__dirname + "/../framework/zokou");
const axios = require("axios");
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

moment.tz.setDefault(conf.TZ);

zokou({ nomCom: "repo", categorie: "General", reaction: "📦" }, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    const REPO_API = "https://api.github.com/repos/officialPkdriller/NEXUS-AI";
    const REPO_URL = "https://github.com/officialPkdriller/NEXUS-AI";

    try {
        const res = await axios.get(REPO_API, { headers: { "User-Agent": "NEXUS-AI" }, timeout: 10000 });
        const data = res.data;

        const stars = data.stargazers_count || 0;
        const forks = data.forks_count || 0;
        const issues = data.open_issues_count || 0;
        const watchers = data.watchers_count || 0;
        const owner = data.owner.login;
        const repoName = data.name;
        const description = data.description || "No description";
        const lastUpdate = moment(data.updated_at).format("DD/MM/YYYY HH:mm");

        const time = moment().format("HH:mm:ss");
        const date = moment().format("DD/MM/YYYY");

        let msg = `╭─❏ *📦 NEXUS-AI REPOSITORY*\n`;
            msg += `│\n`;
            msg += `│ 📝 Desc: *${description.substring(0, 60)}*\n`;
            msg += `│ 👨‍💻 Dev: *${owner}*\n`;
            msg += `│ 📁 Repo: *${repoName}*\n`;
            msg += `│ ⭐ Stars: *${stars}*\n`;
            msg += `│ 🍴 Forks: *${forks}*\n`;
            msg += `│ 👁 Watchers: *${watchers}*\n`;
            msg += `│ 🐛 Issues: *${issues}*\n`;
            msg += `│ 🔄 Update: *${lastUpdate}*\n`;
            msg += `│ 🌐 Link: ${REPO_URL}\n`;
            msg += `│\n`;
            msg += `│ 📆 Date: *${date}*\n`;
            msg += `│ 🕒 Time: *${time}*\n`;
            msg += `╰───────────────❏`;

        await zk.sendMessage(dest, {
            text: msg
        }, { quoted: ms });

    } catch (e) {
        console.log("❌ Repo Command Error:", e);
        repondre(`❌ Error fetching repo: ${e.message}`);
    }
});
