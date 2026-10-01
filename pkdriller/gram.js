const axios = require("axios");
const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "ig",
    categorie: "Download",
    reaction: "📸",
    aliases: ["gram", "igdl", "instadl"],
    desc: "Download Instagram media"
}, async (dest, zk, commandeOptions) => {

    const { arg, repondre, ms } = commandeOptions;

    if (!arg[0]) {
        return repondre(
            "❌ Please provide an Instagram link."
        );
    }

    const q = arg.join(" ");

    if (!q.includes("instagram.com")) {
        return repondre(
            "❌ Invalid Instagram link."
        );
    }

    try {

        await zk.sendMessage(dest, {
            react: {
                text: "⏳",
                key: ms.key
            }
        });

        const apiUrl =
            `https://blaze-api.zone.id/api/instagram/download?url=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl);

        if (
            !data.success ||
            !data.data ||
            !data.data.status
        ) {
            return repondre(
                "⚠️ Failed to fetch Instagram media."
            );
        }

        const items = data.data.data;

        if (!items || !items.length) {
            return repondre(
                "⚠️ Media not found in response."
            );
        }

        const caption =
            "╔══════════════════❒\n" +
            "║ 📸 *NEXUS-AI INSTAGRAM*\n" +
            "╚══════════════════❒";

        // Send caption first
        await zk.sendMessage(
            dest,
            {
                text: caption
            },
            {
                quoted: ms
            }
        );

        // Send each media item
        // Supports carousel posts with multiple items
        for (const item of items) {

            if (!item.url) continue;

            const isVideo =
                /\.mp4(\?|$)/i.test(item.url);

            if (isVideo) {

                await zk.sendMessage(
                    dest,
                    {
                        video: {
                            url: item.url
                        }
                    },
                    {
                        quoted: ms
                    }
                );

            } else {

                await zk.sendMessage(
                    dest,
                    {
                        image: {
                            url: item.url
                        }
                    },
                    {
                        quoted: ms
                    }
                );
            }
        }

        await zk.sendMessage(dest, {
            react: {
                text: "✅",
                key: ms.key
            }
        });

    } catch (error) {

        console.error(
            "Instagram Error:",
            error
        );

        await zk.sendMessage(dest, {
            react: {
                text: "❌",
                key: ms.key
            }
        }).catch(() => {});

        return repondre(
            "❌ An error occurred while downloading the Instagram media."
        );
    }
});
