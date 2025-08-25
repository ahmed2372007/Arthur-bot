const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'db');
const dbFile = path.join(dbDir, 'marriages.json');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}');

function loadMarriages() {
  try {
    return JSON.parse(fs.readFileSync(dbFile));
  } catch {
    return {};
  }
}

function saveMarriages(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

module.exports = {
  command: ['طلاق'],
  category: 'مرح',
  description: 'إنهاء الزواج بالرد أو المنشن للطرف الآخر',
  usage: '.طلاق (رد على رسالة أو منشن)',

  async execute(sock, msg, args = []) {
    const sender = msg.sender || msg.key.participant || msg.key.remoteJid || '';
    const chatId = msg.key.remoteJid;

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
    const mentionedJid = contextInfo.mentionedJid || [];
    const quotedParticipant = contextInfo.participant;

    let target = null;

    if (mentionedJid.length > 0) {
      target = mentionedJid[0];
    } else if (quotedParticipant) {
      target = quotedParticipant;
    } else {
      await sock.sendMessage(chatId, {
        text: '⚠️ يرجى الرد على رسالة الطرف الآخر أو منشنه مع الأمر.',
      }, { quoted: msg });
      return;
    }

    if (target === sender) {
      await sock.sendMessage(chatId, {
        text: '🤦‍♂️ لا يمكنك تطليق نفسك.',
      }, { quoted: msg });
      return;
    }

    const marriages = loadMarriages();

    // تحقق إذا الزواج موجود بين الطرفين
    if (!marriages[sender] || marriages[sender][1] !== target) {
      await sock.sendMessage(chatId, {
        text: '❌ أنت غير متزوج بهذا الشخص أو لم يتم تسجيل الزواج بشكل صحيح.',
      }, { quoted: msg });
      return;
    }

    // حذف الزواج للطرفين
    delete marriages[sender];
    delete marriages[target];
    saveMarriages(marriages);

    await sock.sendMessage(chatId, {
      text: `
💔 *تم الطلاق بنجاح* 💔

👰 سابقًا: @${target.split('@')[0]}
🤵 سابقًا: @${sender.split('@')[0]}
نتمنى لكم حياة جديدة مليئة بالخير والسلام. ✨
𝑺𝑼𝑲𝑼𝑵𝑨
      `,
      mentions: [sender, target]
    }, { quoted: msg });
  }
};