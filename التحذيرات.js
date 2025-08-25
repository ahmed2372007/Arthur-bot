const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '../data/warnings.json');

let warnings = {};
if (fs.existsSync(warningsPath)) {
  warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
}

module.exports = {
  command: 'التحذيرات',
  category: 'group',
  description: 'عرض عدد التحذيرات لجميع أعضاء المجموعة.',
  group: true,

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    if (!warnings[chatId]) {
      return await sock.sendMessage(chatId, {
        text: '📋 لا يوجد أي تحذيرات مسجلة في هذه المجموعة.',
      }, { quoted: msg });
    }

    const groupWarnings = warnings[chatId];
    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants;

    let reply = '📋 قائمة التحذيرات:\n\n';
    let mentions = [];

    for (const member of participants) {
      const id = member.id;
      const count = groupWarnings[id] || 0;
      if (count > 0) {
        reply += `🔸 @${id.split('@')[0]}: ${count} تحذير\n`;
        mentions.push(id);
      }
    }

    if (mentions.length === 0) {
      reply += 'لا يوجد أعضاء لديهم تحذيرات.';
    }

    await sock.sendMessage(chatId, {
      text: reply,
      mentions
    }, { quoted: msg });
  }
};