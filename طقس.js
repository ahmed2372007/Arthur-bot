const axios = require("axios");

module.exports = {
  command: ["الطقس", "طقس", "weather"],
  description: "🌦️ يعرض حالة الطقس في مدينة محددة",
  category: "tools",

  async execute(sock, msg) {
    const fullText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    const match = fullText.trim().match(/^(?:الطقس|طقس|weather)\s+(.+)/i);
    if (!match) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '🌍 من فضلك حدد اسم المدينة.\n\nمثال: الطقس القاهرة',
      }, { quoted: msg });
    }

    const city = match[1].trim();
    const apiKey = '4902c0f2550f58298ad4146a92b65e10';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ar`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const weatherText = `🌦️ *الطقس في ${data.name}*\n\n` +
        `🌡️ الحرارة: *${data.main.temp}°C*\n` +
        `🤒 الإحساس الحقيقي: *${data.main.feels_like}°C*\n` +
        `💧 الرطوبة: *${data.main.humidity}%*\n` +
        `🌬️ سرعة الرياح: *${data.wind.speed} م/ث*\n` +
        `☁️ الحالة: *${data.weather[0].description}*`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: weatherText,
      }, { quoted: msg });

    } catch (error) {
      console.error("❌ خطأ في الطقس:", error.message);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚠️ حصل خطأ أثناء جلب الطقس. تأكد من اسم المدينة وحاول مرة أخرى.",
      }, { quoted: msg });
    }
  },
};