const { isElite } = require('../haykala/elite.js');

module.exports = {
  command: "مؤقت",
  description: "⏳ بدء عد تنازلي لعدد معين من الثواني.",
  usage: ".مؤقت [عدد الثواني]",

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || chatId;

      if (!(await isElite(sender))) {
        return await sock.sendMessage(chatId, {
          text: "❌ هذا الأمر مخصص للنخبة فقط!"
        }, { quoted: msg });
      }

      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const input = body.replace('.مؤقت', '').trim();

      const totalSeconds = parseInt(input);
      if (isNaN(totalSeconds) || totalSeconds <= 0) {
        return await sock.sendMessage(chatId, {
          text: "❌ من فضلك أدخل عدد الثواني بشكل صحيح. مثال: `.مؤقت 60`"
        }, { quoted: msg });
      }

      let remaining = totalSeconds;
      const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
      };

      const countdownMsg = await sock.sendMessage(chatId, {
        text: `⏳ العد التنازلي بدأ: ${formatTime(remaining)}`
      }, { quoted: msg });

      const interval = setInterval(async () => {
        remaining--;

        if (remaining <= 0) {
          clearInterval(interval);
          return await sock.sendMessage(chatId, {
            text: `✅ انتهى الوقت!`
          }, { quoted: msg });
        }

        // تعديل الرسالة الأصلية (لو جهازك يدعم)
        await sock.sendMessage(chatId, {
          edit: countdownMsg.key,
          text: `⏳ الوقت المتبقي: ${formatTime(remaining)}`
        });
      }, 1000);

    } catch (error) {
      console.error("✗ خطأ في أمر مؤقت:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};