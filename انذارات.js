const fs = require('fs');
const path = require('path');

const WARNINGS_FILE = path.join(__dirname, '../data/warnings.json'); // عدّل المسار حسب مكان تخزينك

// تحميل بيانات الإنذارات
function loadWarnings() {
  if (!fs.existsSync(WARNINGS_FILE)) {
    fs.writeFileSync(WARNINGS_FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(WARNINGS_FILE));
}

module.exports = {
  command: 'انذارات',
  category: 'admin',
  description: 'عرض جميع الإنذارات الموجودة في المجموعة.',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    // جلب بيانات الإنذارات
    let warnings = loadWarnings();

    if (!warnings[chatId] || Object.keys(warnings[chatId]).length === 0) {
      return sock.sendMessage(chatId, { text: '✅ لا يوجد أي إنذارات في هذه المجموعة.' }, { quoted: msg });
    }

    // جلب بيانات المجموعة للحصول على أسماء الأعضاء
    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(chatId);
    } catch (e) {
      return sock.sendMessage(chatId, { text: '❌ لم أتمكن من جلب بيانات المجموعة.' }, { quoted: msg });
    }

    // بناء نص الإنذارات
    let text = `⚠️ قائمة الإنذارات في المجموعة:\n\n`;

    for (const [userId, count] of Object.entries(warnings[chatId])) {
      if (count > 0) {
        // البحث عن اسم العضو في بيانات المجموعة
        const participant = groupMetadata.participants.find(p => p.id === userId);
        const username = participant ? participant.notify || participant.id.split('@')[0] : userId.split('@')[0];
        text += `@${username} → عدد الإنذارات: ${count}\n`;
      }
    }

    if (text === `⚠️ قائمة الإنذارات في المجموعة:\n\n`) {
      text = '✅ لا يوجد أي إنذارات حالياً.';
    }

    await sock.sendMessage(chatId, { text, mentions: Object.keys(warnings[chatId]) }, { quoted: msg });
  }
};