const axios = require("axios");
const { zokou } = require("../framework/zokou");

const PUBLIC_AI_API =
    "https://mqudqfsvnvlcptsgdceo.supabase.co/functions/v1/whatsapp-chat";

const builtInBase = String(
    process.env.BUILT_IN_FORGE_API_URL || ""
).replace(/\/$/, "");

const builtInKey = String(
    process.env.BUILT_IN_FORGE_API_KEY || ""
).trim();

const useBuiltIn = Boolean(builtInBase && builtInKey);

const AI_API =
    process.env.BLAZE_CHATBOT_API ||
    (useBuiltIn
        ? `${builtInBase}/v1/chat/completions`
        : PUBLIC_AI_API);

const MAX_QUERY_LENGTH = 1800;

const MODES = {
    code:
        "You are an expert programmer. Provide correct, clean code with a concise explanation.",

    creative:
        "You are a creative writer. Make the response vivid, original, and well structured.",

    explain:
        "You are a patient teacher. Explain the topic simply, with examples when helpful."
};


// ============================================================
// EXTRACT QUOTED TEXT
// ============================================================

function extractQuotedText(message) {
    if (!message) return "";

    return String(
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        ""
    ).trim();
}


// ============================================================
// CHECK IF MESSAGE IS AN AI RESPONSE
// ============================================================

function isLikelyAiResponse(text) {
    return (
        /^╭━━━〔\s*🤖\s*NEXUS-AI/i.test(text) ||
        /^🤖\s*\*?NEXUS-AI/i.test(text) ||
        /╰━━━〔\s*NEXUS-AI\s*〕━━━╯/i.test(text)
    );
}


// ============================================================
// EXTRACT RESPONSE TEXT
// ============================================================

function responseText(data) {
    const value =
        data?.reply ??
        data?.response ??
        data?.answer ??
        data?.result ??
        data?.choices?.[0]?.message?.content;

    if (Array.isArray(value)) {
        return value
            .map((item) => item?.text || "")
            .join("");
    }

    return value;
}


// ============================================================
// REQUEST AI ANSWER
// ============================================================

async function requestAnswer(instruction, conversationId) {

    const headers = {
        "Content-Type": "application/json"
    };

    const builtInRequest =
        useBuiltIn && !process.env.BLAZE_CHATBOT_API;

    const payload = builtInRequest
        ? {
            model:
                process.env.BLAZE_CHATBOT_MODEL ||
                "gpt-5-mini",

            messages: [
                {
                    role: "system",
                    content:
                        "You are NEXUS-AI, a concise and helpful WhatsApp assistant. Keep ordinary replies short unless detail is requested."
                },
                {
                    role: "user",
                    content: instruction
                }
            ],

            max_completion_tokens: 700
        }

        : {
            message: instruction,
            conversation_id: conversationId
        };

    if (builtInRequest) {
        headers.Authorization = `Bearer ${builtInKey}`;
    }

    const response = await axios.post(
        AI_API,
        payload,
        {
            timeout: 60_000,
            headers
        }
    );

    const answer = responseText(
        response.data || {}
    );

    if (
        answer === undefined ||
        answer === null
    ) {
        throw new Error(
            "AI service returned no answer."
        );
    }

    return String(answer).trim();
}


// ============================================================
// NEXUS-AI GPT / AI COMMAND
// ============================================================

zokou(
    {
        nomCom: "gpt",
        aliases: [
            "ai",
            "ask",
            "aiask",
            "askgpt"
        ],
        categorie: "Search",
        reaction: "🤖",
        desc: "Ask NEXUS-AI anything"
    },

    async (dest, zk, commandeOptions) => {

        const {
            arg = [],
            repondre,
            ms,
            msgRepondu
        } = commandeOptions;

        const first =
            String(arg[0] || "").toLowerCase();

        const quotedText =
            extractQuotedText(msgRepondu);

        const replyingToAi =
            isLikelyAiResponse(quotedText);


        // ====================================================
        // HELP
        // ====================================================

        if (
            (!arg.length && !replyingToAi) ||
            ["help", "?"].includes(first)
        ) {
            return repondre([
                "╭━━━〔 🤖 NEXUS-AI 〕━━━╮",
                "",
                "`.ai your question` or `.gpt your question` — ask anything",
                "`.gpt code write a JavaScript function` — coding mode",
                "`.gpt explain async and await` — explanation mode",
                "`.gpt creative write a short story` — creative mode",
                "",
                "Reply to an AI answer with `.gpt your follow-up` to continue that conversation.",
                "",
                "Short aliases: `.ai`, `.ask`, `.aiask`, `.askgpt`",
                "",
                "╰━━━〔 NEXUS-AI 〕━━━╯"
            ].join("\n"));
        }


        // ====================================================
        // DETERMINE MODE
        // ====================================================

        let mode = "general";

        let query =
            arg.join(" ").trim();

        if (MODES[first]) {

            mode = first;

            query =
                arg
                    .slice(1)
                    .join(" ")
                    .trim();
        }


        // ====================================================
        // CONTINUE PREVIOUS AI CONVERSATION
        // ====================================================

        if (
            !query &&
            replyingToAi
        ) {
            query =
                "Continue the previous answer and provide the next useful detail.";
        }


        if (!query) {
            return repondre(
                `❌ Add a question after the ${mode} mode.`
            );
        }


        // ====================================================
        // QUERY LENGTH LIMIT
        // ====================================================

        if (
            query.length >
            MAX_QUERY_LENGTH
        ) {
            return repondre(
                `❌ Keep your question under ${MAX_QUERY_LENGTH} characters.`
            );
        }


        // ====================================================
        // PROCESSING REACTION
        // ====================================================

        await zk.sendMessage(
            dest,
            {
                react: {
                    text: "⏳",
                    key: ms.key
                }
            }
        ).catch(() => {});


        try {

            // =================================================
            // BUILD INSTRUCTION
            // =================================================

            let instruction =
                MODES[mode]
                    ? `${MODES[mode]}\n\nUser request:\n${query}`
                    : query;


            // =================================================
            // FOLLOW-UP TO AI MESSAGE
            // =================================================

            if (replyingToAi) {

                const trimmedQuoted =
                    quotedText.slice(0, 3800);

                instruction = [
                    "Continue the conversation using the previous AI answer below as context.",
                    "Do not repeat the entire previous answer unless the user asks for it.",
                    "",
                    `Previous AI answer:\n${trimmedQuoted}`,
                    "",
                    `Follow-up request:\n${instruction}`
                ].join("\n");
            }


            // =================================================
            // REQUEST ANSWER
            // =================================================

            let answer =
                (
                    await requestAnswer(
                        instruction,
                        `gpt:${dest}`
                    )
                ).slice(0, 3800);


            if (!answer) {
                throw new Error(
                    "AI service returned an empty answer."
                );
            }


            // =================================================
            // RESPONSE LABELS
            // =================================================

            const modeLabel =
                mode === "general"
                    ? ""
                    : `\n🧭 *Mode:* ${mode.toUpperCase()}\n`;

            const continuationLabel =
                replyingToAi
                    ? "\n🔁 *Conversation continued*\n"
                    : "";


            // =================================================
            // NEXUS-AI OUTPUT
            // =================================================

            const output = [
                "╭━━━〔 🤖 NEXUS-AI 〕━━━╮",
                `${modeLabel}${continuationLabel}`,
                `📝 *Request:* ${query.slice(0, 180)}${query.length > 180 ? "…" : ""}`,
                "",
                answer,
                "",
                "╰━━━〔 NEXUS-AI 〕━━━╯"
            ].join("\n");


            // =================================================
            // SEND ANSWER
            // =================================================

            await zk.sendMessage(
                dest,
                {
                    text: output
                },
                {
                    quoted: ms
                }
            );


            // =================================================
            // SUCCESS REACTION
            // =================================================

            await zk.sendMessage(
                dest,
                {
                    react: {
                        text: "✅",
                        key: ms.key
                    }
                }
            ).catch(() => {});


        } catch (error) {

            console.error(
                "[NEXUS-AI GPT]",
                error.response?.data ||
                error.message ||
                error
            );


            // =================================================
            // ERROR REACTION
            // =================================================

            await zk.sendMessage(
                dest,
                {
                    react: {
                        text: "❌",
                        key: ms.key
                    }
                }
            ).catch(() => {});


            return repondre(
                "❌ AI request failed. The service may be busy; please try again shortly."
            );
        }
    }
);
