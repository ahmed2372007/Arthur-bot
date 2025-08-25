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

const choices = ['حجرة', 'ورقة', 'مقص'];

module.exports = {
  command: 'حجرة',
  category: 'game',
  description: '🎮 لعبة حجرة ورقة مقص ضد البوت!',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const userChoice = args[0]?.trim();
    if (!userChoice || !choices.includes(userChoice)) {
      return sock.sendMessage(chatId, {
        text: `🔰 *اختر واحدة من:* حجرة / ورقة / مقص\n\n✍️ مثال: .حجرة ورقة`,
      }, { quoted: msg });
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    let pointMessage = '';
    const sender = msg.key.participant || msg.key.remoteJid;

    if (userChoice === botChoice) {
      result = '🔁 تعادل!';
    } else if (
      (userChoice === 'حجرة' && botChoice === 'مقص') ||
      (userChoice === 'ورقة' && botChoice === 'حجرة') ||
      (userChoice === 'مقص' && botChoice === 'ورقة')
    ) {
      result = '🎉 فزت!';

      // إضافة النقاط
      if (!points[sender]) points[sender] = 0;
      points[sender] += 1;
      savePoints();

      pointMessage = `\n🏆 رصيدك الآن: *${points[sender]}* نقطة.`;
    } else {
      result = '😢 خسرت!';
    }

    await sock.sendMessage(chatId, {
      text: `🎮 *لعبة حجرة ورقة مقص*\n\n👤 اختيارك: ${userChoice}\n🤖 اختيار البوت: ${botChoice}\n\n📢 النتيجة: ${result}${pointMessage}`,
    }, { quoted: msg });
  }
};