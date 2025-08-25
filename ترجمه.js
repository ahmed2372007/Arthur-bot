const axios = require("axios");

module.exports = {
  command: 'ترجمه',
  description: 'ترجمة نص من عربي لإنجليزي أو العكس 🌐',
  category: 'tools',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const text = body.trim().split(' ').slice(1).join(' ');

    if (!text) {
      return sock.sendMessage(chatId, {
        text: "✍️ اكتب جملة بعد الأمر .ترجمه علشان أترجمها.\nمثال: .ترجمه كيف حالك؟"
      }, { quoted: msg });
    }

    try {
      const isArabic = /[\u0600-\u06FF]/.test(text);
      const sourceLang = isArabic ? 'ar' : 'en';
      const targetLang = isArabic ? 'en' : 'ar';

      const res = await axios.get('https://translate.googleapis.com/translate_a/single', {
        params: {
          client: 'gtx',
          sl: sourceLang,
          tl: targetLang,
          dt: 't',
          q: text
        }
      });

      const translated = res.data[0][0][0];

      await sock.sendMessage(chatId, {
        text: `🌍 *النص المترجم:*\n${translated}`
      }, { quoted: msg });

    } catch (err) {
      console.error("ترجمة Google فشلت:", err);
      await sock.sendMessage(chatId, {
        text: "❌ للأسف، حصلت مشكلة في الترجمة. جرب تاني بعد شوية 🌐"
      }, { quoted: msg });
    }
  }
};