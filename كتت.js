const fs = require('fs');
const path = require('path');

// إعدادات اللعبة
const gameSettings = {
  timeout: 60000,
  points: 500,
  dataFile: path.resolve(__dirname, './كت.json') // استخدام path لتفادي مشاكل المسارات
};

// بنك نقاط بسيط (في الذاكرة)
const userPoints = {};

module.exports = {
  command: ['كتت'],
  description: 'يرسل لك لغز عشوائي وتحصل على نقاط إن أجبت بشكل صحيح',
  category: 'العاب',
  async execute(sock, msg) {
    sock.tekateki = sock.tekateki || {};
    const chatId = msg.key.remoteJid;
    const senderId = msg.key.participant || msg.key.remoteJid;

    if (chatId in sock.tekateki) {
      await sock.sendMessage(chatId, {
        text: '⚠️ *｢❤️｣⇊ يوجد لغز نشط بالفعل!*! الرجاء الانتظار حتى ينتهي الوقت.',
      }, { quoted: sock.tekateki[chatId].message });
      return;
    }

    try {
      // التحقق من وجود الملف
      if (!fs.existsSync(gameSettings.dataFile)) {
        throw new Error(`الملف غير موجود: ${gameSettings.dataFile}`);
      }

      // قراءة الملف وتحويله إلى JSON
      const rawData = fs.readFileSync(gameSettings.dataFile, 'utf8');
      const tekatekiData = JSON.parse(rawData);

      if (!Array.isArray(tekatekiData) || tekatekiData.length === 0) {
        throw new Error('ملف الأسئلة فارغ أو غير بصيغة مصفوفة صحيحة.');
      }

      const randomQuestion = tekatekiData[Math.floor(Math.random() * tekatekiData.length)];

      const questionMessage = `
🎯 *السؤال*:
${randomQuestion.question}

👤 *اللاعب*: @${senderId.split('@')[0]}
⏳ *الوقت*: ${(gameSettings.timeout / 1000)} ثانية
🏆 *الجائزة*: ${gameSettings.points} نقطة

📌 *ملاحظة*: اكتب إجابتك في رسالة مباشرة
`.trim();

      const sentMsg = await sock.sendMessage(chatId, {
        text: questionMessage,
        mentions: [senderId],
      }, { quoted: msg });

      // حفظ السؤال النشط
      sock.tekateki[chatId] = {
        question: randomQuestion,
        sender: senderId,
        message: sentMsg,
        timeout: setTimeout(async () => {
          if (sock.tekateki[chatId]) {
            await sock.sendMessage(chatId, {
              text: `⌛ انتهى الوقت!\n\n✅ الإجابة الصحيحة كانت: *${randomQuestion.response}*`,
            }, { quoted: sock.tekateki[chatId].message });
            delete sock.tekateki[chatId];
          }
        }, gameSettings.timeout)
      };

      // الاستماع للردود
      const onMessage = async ({ messages }) => {
        const incomingMsg = messages[0];
        const fromChat = incomingMsg.key.remoteJid;
        const text = incomingMsg.message?.conversation?.trim();

        if (!text || !(fromChat in sock.tekateki)) return;

        const game = sock.tekateki[fromChat];
        const responder = incomingMsg.key.participant || incomingMsg.key.remoteJid;

        if (responder === game.sender) {
          if (text.toLowerCase() === game.question.response.toLowerCase()) {
            clearTimeout(game.timeout);

            userPoints[game.sender] = (userPoints[game.sender] || 0) + gameSettings.points;

            await sock.sendMessage(fromChat, {
              text: `🎉 أحسنت! إجابتك صحيحة ✅\n\n🏆 تم منحك ${gameSettings.points} نقطة!`,
            }, { quoted: incomingMsg });

            delete sock.tekateki[fromChat];
            sock.ev.off('messages.upsert', onMessage); // إزالة المستمع بعد انتهاء اللعبة
          }
        }
      };

      sock.ev.on('messages.upsert', onMessage);

    } catch (error) {
      console.error('❌ خطأ في تحميل الألغاز:', error.message);
      await sock.sendMessage(chatId, {
        text: `❌ حدث خطأ في تحميل الأسئلة:\n${error.message}`,
      }, { quoted: msg });
    }
  }
};