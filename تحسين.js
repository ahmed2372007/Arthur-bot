const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    command: ["تحسين"],
    category: "ai",
    description: "تحسين جودة صورة يتم الرد عليها",
    usage: ".تحسين (بالرد على صورة)",

    async execute(sock, msg) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMsg) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ قم بالرد على صورة لتحسين جودتها."
                }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: "⏳ جـاري تـحـسـيـن الـصـورة... 🖼️"
            }, { quoted: msg });

            const buffer = await downloadMediaMessage(
                { message: imageMsg },
                "buffer",
                {},
                { logger: console, reuploadRequest: sock.updateMediaMessage }
            );

            const enhancedImage = await remini(buffer, "enhance");

            await sock.sendMessage(msg.key.remoteJid, {
                image: enhancedImage,
                caption: "✨ تم تحسين الصورة بنجاح!"
            }, { quoted: msg });
        } catch (err) {
            console.error("تحسين Error:", err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ حدث خطأ أثناء معالجة الصورة. تأكد أنك رددت على صورة."
            }, { quoted: msg });
        }
    }
};

async function remini(imageData, operation) {
    return new Promise((resolve, reject) => {
        const availableOperations = ["enhance", "recolor", "dehaze"];
        if (!availableOperations.includes(operation)) {
            operation = "enhance";
        }

        const formData = new FormData();
        formData.append("image", imageData, {
            filename: "image.jpg",
            contentType: "image/jpeg",
        });
        formData.append("model_version", 1);

        formData.submit({
            host: "inferenceengine.vyro.ai",
            path: `/${operation}`,
            protocol: "https:",
            headers: {
                "User-Agent": "okhttp/4.9.3",
                Connection: "Keep-Alive",
                "Accept-Encoding": "gzip",
            },
        }, (err, res) => {
            if (err) return reject(err);
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));
            res.on("end", () => resolve(Buffer.concat(chunks)));
            res.on("error", err => reject(err));
        });
    });
}