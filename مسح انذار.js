const fs = require('fs');
const path = require('path');
const warnsFile = path.join(__dirname, '../data/warns.json');

function loadWarns() {
  try {
    if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, '{}');
    const data = fs.readFileSync(warnsFile);
    return JSON.parse(data.length ? data : '{}');
  } catch {
    fs.writeFileSync(warnsFile, '{}');
    return {};
  }
}

function saveWarns(warns) {
  fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
}

module.exports = {
  command: 'مسح',
  description: '🧹 مسح إنذارات عضو (للمشرفين فقط)',
  usage: '.مسح_انذارات @العضو',
  groupOnly: true,

  async execute(sock, msg) {
    const groupId = msg.key.remoteJid;

    if (!groupId.endsWith('@g.us')) {
      return sock.sendMessage(groupId, { text: '❌ هذا الأمر يعمل في الجروبات فقط' }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(groupId);
    const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
    const isAdmin = metadata.participants.some(
      p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!isAdmin) {
      return sock.sendMessage(groupId, { text: '🚫 هذا الأمر مخصص للمشرفين فقط.' }, { quoted: msg });
    }

    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) {
      return sock.sendMessage(groupId, {
        text: '❌ منشن عضو لمسح إنذاراته.\nمثال:\n.مسح_انذارات @العضو'
      }, { quoted: msg });
    }

    const warns = loadWarns();
    if (warns?.[groupId]?.[mention]) {
      warns[groupId][mention] = 0;
      saveWarns(warns);
      return sock.sendMessage(groupId, {
        text: `✅ تم مسح إنذارات @${mention.split('@')[0]}.`,
        mentions: [mention]
      }, { quoted: msg });
    } else {
      return sock.sendMessage(groupId, {
        text: `ℹ️ العضو @${mention.split('@')[0]} ليس لديه أي إنذارات.`,
        mentions: [mention]
      }, { quoted: msg });
    }
  }
};