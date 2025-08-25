const riddles = require('../data/riddles');
const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, '../data/ranks.json');
let points = {};

if (fs.existsSync(pointsFile)) {
  points = JSON.parse(fs.readFileSync(pointsFile));
}

function savePoints() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

module.exports = {
  command: 'لغز',
  category: 'game',
  description: 'أرسل لغز للمجموعة وعلى الأعضاء حلّه.',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const riddle = riddles[Math.floor(Math.random() * riddles.length)];

    await sock.sendMessage(chatId, {
      text: `🧠 لغز:\n${riddle.question}\n\n✏️ عندك 30 ثانية للإجابة!`,
    }, { quoted: msg });

    const filter = m =>
      m.key.remoteJid === chatId &&
      m.message &&
      m.message.conversation &&
      m.message.conversation.trim().toLowerCase() === riddle.answer.toLowerCase();

    const onMessage = async ({ messages }) => {
      const correct = messages.find(filter);
      if (correct) {
        const sender = correct.key.participant || correct.key.remoteJid;

        // احسب النقطة
        if (!points[sender]) points[sender] = 0;
        points[sender] += 1;
        savePoints();

        await sock.sendMessage(chatId, {
          text: `✅ إجابة صحيحة! مبروك 🎉\n🏆 رصيدك الآن: *${points[sender]}* نقطة.`,
        }, { quoted: correct });

        sock.ev.off('messages.upsert', onMessage);
        clearTimeout(timeout);
      }
    };

    sock.ev.on('messages.upsert', onMessage);

    const timeout = setTimeout(async () => {
      sock.ev.off('messages.upsert', onMessage);
      await sock.sendMessage(chatId, {
        text: `⌛ انتهى الوقت!\nالإجابة الصحيحة كانت: *${riddle.answer}*`,
      }, { quoted: msg });
    }, 30000);
  }
};