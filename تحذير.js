const fs = require('fs'); const path = require('path'); const { isElite } = require('../haykala/elite');

const warningsFile = path.join(__dirname, '../data/warnings.json'); if (!fs.existsSync(warningsFile)) fs.writeFileSync(warningsFile, '{}');

let warnings = JSON.parse(fs.readFileSync(warningsFile));

function saveWarnings() { fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2)); }

module.exports = { command: 'تحذير', category: 'admin', description: 'يعطي تحذير لعضو وإذا وصل لـ 3 يتم طرده تلقائيًا.', usage: '.تحذير @العضو', group: true,

async execute(sock, msg) { const chatId = msg.key.remoteJid; const sender = msg.key.participant || msg.key.remoteJid;

if (!(await isElite(sender))) {
  return sock.sendMessage(chatId, { text: '❌ هذا الأمر مخصص للمشرفين فقط.' }, { quoted: msg });
}

const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
if (!mentionedJid) {
  return sock.sendMessage(chatId, { text: '❌ من فضلك منشن عضو لإعطائه تحذير.' }, { quoted: msg });
}

if (!warnings[chatId]) warnings[chatId] = {};
if (!warnings[chatId][mentionedJid]) warnings[chatId][mentionedJid] = 0;

warnings[chatId][mentionedJid]++;
saveWarnings();

const userWarnings = warnings[chatId][mentionedJid];

if (userWarnings >= 3) {
  await sock.groupParticipantsUpdate(chatId, [mentionedJid], 'remove');
  delete warnings[chatId][mentionedJid];
  saveWarnings();

  return sock.sendMessage(chatId, {
    text: `❌ تم طرد @${mentionedJid.split('@')[0]} بعد حصوله على 3 تحذيرات!`,
    mentions: [mentionedJid]
  }, { quoted: msg });
}

await sock.sendMessage(chatId, {
  text: `⚠️ تم إعطاء @${mentionedJid.split('@')[0]} تحذير (${userWarnings}/3).`,
  mentions: [mentionedJid]
}, { quoted: msg });

} };

