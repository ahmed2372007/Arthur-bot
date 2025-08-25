const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  command: "نعم",
  description: "رد ساخر على كلمة نعم",
  usage: ".نعم",
  category: "fun",

  async execute(sock, msg) {
    try {
      let imageBuffer = null;

      try {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const pfpUrl = await sock.profilePictureUrl(senderJid, "image");
        if (pfpUrl) {
          const res = await axios.get(pfpUrl, { responseType: "arraybuffer" });
          imageBuffer = Buffer.from(res.data, "binary");
        }
      } catch (e) {
        // تجاهل الخطأ لو فشل جلب صورة البروفايل
      }

      if (!imageBuffer) {
        const fallbackPath = path.join(process.cwd(), "image.jpeg");
        if (fs.existsSync(fallbackPath)) {
          imageBuffer = fs.readFileSync(fallbackPath);
        }
      }

      const replies = [
        "نعم الله عليك، وش بدك أيُّها العاق 😤",
        "نعم أوف! استرجلت وبطلت تقول يب 😂",
        "نعم؟ لا تكون فجأة بطلت تتنفس كمان؟ 🐸",
        "نعم نعم نعم... خُش في الموضوع يا نجم 🌟",
        "بس كده؟ نعم وبس؟ فينك من زمان؟ 😒",
        "نعم يا كبير، شكلك جايب خبر مهم 😎"
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      await sock.sendMessage(msg.key.remoteJid, {
        text: randomReply,
        contextInfo: {
          externalAdReply: {
            title: "رد على 'نعم' 😏",
            body: "الرد جاك يا خطير",
            thumbnail: imageBuffer,
            mediaType: 1,
            sourceUrl: "https://t.me/KINGSLO1l",
            renderLargerThumbnail: false,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في أمر "نعم":', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `حصل خطأ:\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};