const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite.js');

const filePath = path.join(__dirname, '..', 'data', 'bannedWords.json');

module.exports = {
  command: "إزالة",
  description: "إزالة كلمة من الكلمات المحظورة",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const wordToRemove = body.replace('.إزالة', '').trim();

    if (!(await isElite(sender))) {
      return await sock.sendMessage(chatId, { text: "❌ هذا الأمر مخصص للنخبة فقط!" }, { quoted: msg });
    }

    if (!wordToRemove) {
      return await sock.sendMessage(chatId, { text: "❌ يجب كتابة الكلمة التي تريد إزالتها!" }, { quoted: msg });
    }

    if (!fs.existsSync(filePath)) {
      return await sock.sendMessage(chatId, { text: "⚠️ لا توجد قائمة كلمات محظورة." }, { quoted: msg });
    }

    let bannedWords = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!bannedWords.includes(wordToRemove)) {
      return await sock.sendMessage(chatId, { text: `⚠️ الكلمة "${wordToRemove}" غير موجودة في القائمة.` }, { quoted: msg });
    }

    bannedWords = bannedWords.filter(word => word !== wordToRemove);
    fs.writeFileSync(filePath, JSON.stringify(bannedWords, null, 2), 'utf8');

    await sock.sendMessage(chatId, { text: `✅ تم إزالة الكلمة "${wordToRemove}" من القائمة.` }, { quoted: msg });
  }
};