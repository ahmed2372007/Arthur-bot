const cases = require('../data/cases');
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
  command: "القاتل",
  category: "game",
  description: "لعبة من القاتل - جاوب على الجريمة.",
  
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const crimeCase = cases[Math.floor(Math.random() * cases.length)];

    await sock.sendMessage(chatId, {
      text: `${crimeCase.crime}\n\n👥 المشتبه بهم:\n${crimeCase.suspects.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n❓ من تعتقد أنه القاتل؟ اكتب الاسم كما هو تماماً خلال 30 ثانية!`,
    }, { quoted: msg });

    const filter = m =>
      m.key.remoteJid === chatId &&
      m.message &&
      m.message.conversation &&
      m.message.conversation.trim().toLowerCase() === crimeCase.killer.toLowerCase();

    const onMessage = async ({ messages }) => {
      const reply = messages.find(filter);
      if (reply) {
        const sender = reply.key.participant || reply.key.remoteJid;
        if (!points[sender]) points[sender] = 0;
        points[sender] += 1;
        savePoints();

        await sock.sendMessage(chatId, {
          text: `🕵️‍♀️ صحيح! القاتل هو *${crimeCase.killer}*!\n👏 الفائز: @${sender.split('@')[0]}\n🏅 عدد نقاطك: *${points[sender]}*`,
          mentions: [sender]
        }, { quoted: reply });

        sock.ev.off('messages.upsert', onMessage);
        clearTimeout(timer);
      }
    };

    sock.ev.on('messages.upsert', onMessage);

    const timer = setTimeout(async () => {
      sock.ev.off('messages.upsert', onMessage);
      await sock.sendMessage(chatId, {
        text: `⌛ انتهى الوقت!\n❌ القاتل كان: *${crimeCase.killer}*`
      }, { quoted: msg });
    }, 30000);
  }
};