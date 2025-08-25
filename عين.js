const images = require('../data/images');
const fs = require('fs');
const path = require('path');

// تحميل نقاط اللاعبين
const pointsFile = path.join(__dirname, '../data/ranks.json');
let points = {};

if (fs.existsSync(pointsFile)) {
  points = JSON.parse(fs.readFileSync(pointsFile));
}

function savePoints() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

module.exports = {
  command: 'عين',
  category: 'game',
  description: 'اعرض صورة عين وعلى المستخدم تخمين الشخصية.',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const image = images[Math.floor(Math.random() * images.length)];

    await sock.sendMessage(chatId, {
      image: { url: image.url },
      caption: `👁️ مين الشخصية من العين دي؟\n🕒 عندك 30 ثانية.`,
    }, { quoted: msg });

    const filter = m =>
      m.key.remoteJid === chatId &&
      m.message &&
      m.message.conversation &&
      m.message.conversation.trim().toLowerCase().includes(image.name.toLowerCase());

    const onMessage = async ({ messages }) => {
      const correct = messages.find(filter);
      if (correct) {
        const sender = correct.key.participant || correct.key.remoteJid;

        // إضافة النقاط
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
        text: `❌ انتهى الوقت!\nالإجابة الصحيحة كانت: *${image.name}*`,
      }, { quoted: msg });
    }, 30000);
  }
};