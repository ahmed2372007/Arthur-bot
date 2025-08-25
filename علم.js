const fs = require('fs');
const path = require('path');
const pointsFile = path.join(__dirname, '../data/points.json');

const countries = [
  { emoji: "🇪🇬", name: "مصر", aliases: [] },
  { emoji: "🇸🇦", name: "السعودية", aliases: ["المملكة العربية السعودية"] },
  { emoji: "🇺🇸", name: "الولايات المتحدة", aliases: ["امريكا", "الولايات المتحدة الأمريكية"] },
  { emoji: "🇫🇷", name: "فرنسا", aliases: [] },
  { emoji: "🇬🇧", name: "بريطانيا", aliases: ["المملكة المتحدة", "انجلترا"] },
  { emoji: "🇯🇵", name: "اليابان", aliases: [] },
  { emoji: "🇨🇦", name: "كندا", aliases: [] },
  { emoji: "🇲🇦", name: "المغرب", aliases: [] },
  { emoji: "🇩🇿", name: "الجزائر", aliases: [] },
  { emoji: "🇹🇳", name: "تونس", aliases: [] },
  { emoji: "🇸🇾", name: "سوريا", aliases: [] },
  { emoji: "🇮🇶", name: "العراق", aliases: [] },
  { emoji: "🇵🇸", name: "فلسطين", aliases: [] },
  { emoji: "🇱🇧", name: "لبنان", aliases: [] },
  { emoji: "🇦🇪", name: "الإمارات", aliases: ["الامارات", "الامارات العربية المتحدة"] },
  { emoji: "🇶🇦", name: "قطر", aliases: [] },
  { emoji: "🇰🇼", name: "الكويت", aliases: [] },
  { emoji: "🇧🇭", name: "البحرين", aliases: [] },
  { emoji: "🇴🇲", name: "عُمان", aliases: ["عمان"] },
  { emoji: "🇧🇷", name: "البرازيل", aliases: [] },
  { emoji: "🇹🇷", name: "تركيا", aliases: [] },
  { emoji: "🇳🇵", name: "نيبال", aliases: [] },
  { emoji: "🇲🇳", name: "منغوليا", aliases: [] },
  { emoji: "🇰🇿", name: "كازاخستان", aliases: [] },
  { emoji: "🇦🇲", name: "أرمينيا", aliases: [] },
  { emoji: "🇹🇯", name: "طاجيكستان", aliases: [] },
  { emoji: "🇰🇬", name: "قيرغيزستان", aliases: [] },
  { emoji: "🇹🇲", name: "تركمانستان", aliases: [] },
  { emoji: "🇬🇪", name: "جورجيا", aliases: [] },
  { emoji: "🇺🇿", name: "أوزبكستان", aliases: [] }
];

let currentGame = {};

function loadPoints() {
  if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, '{}');
  return JSON.parse(fs.readFileSync(pointsFile));
}

function savePoints(data) {
  fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2));
}

function addPoints(user, amount) {
  const points = loadPoints();
  points[user] = (points[user] || 0) + amount;
  savePoints(points);
}

module.exports = {
  command: 'علم',
  description: '🌍 لعبة خمن الدولة من العلم',
  usage: '.علم',
  category: 'ترفيه',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const senderName = msg.pushName || 'مستخدم';

    if (currentGame[chatId] && currentGame[chatId].active) {
      return sock.sendMessage(chatId, {
        text: `
🚫 *لا يمكنك بدء لعبة جديدة الآن!*
📌 يوجد جولة حالياً بدأها: *${currentGame[chatId].startedBy}*
⌛ انتظر حتى تنتهي الجولة أو يتم الإجابة.

╰─⟡ 𝑩𝛩𝑻 - 𝑬𝑺𝑪𝑨𝑵𝑶𝑹
`
      }, { quoted: msg });
    }

    const random = countries[Math.floor(Math.random() * countries.length)];

    currentGame[chatId] = {
      answer: random.name.toLowerCase(),
      aliases: random.aliases.map(alias => alias.toLowerCase()),
      startedBy: senderName,
      active: true,
      timeout: setTimeout(() => {
        sock.sendMessage(chatId, {
          text: `⌛ انتهى الوقت! الإجابة كانت: *${random.name}*`
        });
        delete currentGame[chatId];
      }, 30000)
    };

    await sock.sendMessage(chatId, {
      text: `
╭─❒ 『 *🏴 لعبة أعلام الدول* 』 ❒─╮

*𓆩⟬ إعلان الجولة ⟭𓆪*

❁ *اسم التحدي:* ⟶ خمن الدولة  
❁ *العَلَم المعروض:* ⟶ ${random.emoji}  
❁ *المدة المتاحة:* ⟶ 30 ثانية  
❁ *الجائزة:* ⟶ 💰 10 نقاط  
❁ *المُقدم:* ⟶ ${senderName}

*⟬✨ كن أول من يجيب بشكل صحيح! ✨⟭*

╰─⟡ مع تحيات : 𝑩𝛩𝑻 - 𝑬𝑺𝑪𝑨𝑵𝑶𝑹 ⦿
`
    }, { quoted: msg });
  }
};

global.handleGuess = async (sock, msg) => {
  const chatId = msg.key.remoteJid;

  const text =
    msg.message?.conversation?.toLowerCase() ||
    msg.message?.extendedTextMessage?.text?.toLowerCase() ||
    msg.message?.imageMessage?.caption?.toLowerCase() ||
    msg.message?.videoMessage?.caption?.toLowerCase() ||
    '';

  const game = currentGame[chatId];
  if (!game || !text) return;

  const senderJid = msg.key.participant || msg.key.remoteJid;
  const user = senderJid.split('@')[0];

  const allAnswers = [game.answer, ...game.aliases];

  if (allAnswers.some(ans => text.includes(ans))) {
    clearTimeout(game.timeout);
    delete currentGame[chatId];
    addPoints(user, 10);
    const total = loadPoints()[user] || 0;

    await sock.sendMessage(chatId, {
      text: `
🎉 *إجابة صحيحة!*

🏴 الإجابة كانت: *${game.answer}*

💰 *+10 نقاط* تم إضافتهم إلى رصيدك.

👤 *رصيدك الآن:* ${total} نقطة

🎯 تابع اللعب وحاول تتصدر الترتيب!

╰─⟡ 𝑩𝛩𝑻 - 𝑬𝑺𝑪𝑨𝑵𝑶𝑹
`
    }, { quoted: msg });
  }
};