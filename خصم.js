const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, '../data/points.json');

// أرقام المطورين
const developers = ['201065826587', '201011216953', ];

function loadPoints() {
  if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, '{}');
  return JSON.parse(fs.readFileSync(pointsFile));
}

function savePoints(points) {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

module.exports = {
  command: 'خصم',
  description: '➖ خصم نقاط من نفسك أو من شخص آخر (للمطور فقط)',
  usage: '.خصم 500 @العضو',
  category: 'نقاط',

  async execute(sock, msg, args) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderId = sender.split('@')[0];

    if (!developers.includes(senderId)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 هذا الأمر مخصص للمطور فقط!',
      }, { quoted: msg });
    }

    const text = msg.message?.extendedTextMessage?.text || msg.message?.conversation || msg.body || '';
    const numberMatch = text.match(/\.?خصم\s+(\d+)/i);

    if (!numberMatch) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ يرجى كتابة عدد النقاط. مثال:\n\n.خصم 500 @العضو',
      }, { quoted: msg });
    }

    const amount = parseInt(numberMatch[1]);
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const targetId = mention ? mention.split('@')[0] : senderId;

    const points = loadPoints();
    const current = points[targetId] || 0;

    if (current < amount) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ لا يمكن خصم *${amount}* نقطة من <@${targetId}>\n📉 رصيده الحالي: *${current}* فقط.`,
        mentions: mention ? [mention] : []
      }, { quoted: msg });
    }

    points[targetId] -= amount;
    savePoints(points);

    const confirmationText = mention
      ? `╭───❖ 『 *تم الخصم بنجاح* 』❖───╮\n\n➖ تم خصم *${amount}* نقطة من:\n👤 <@${targetId}>\n📞 الرقم: *${targetId}*\n\n╰─⟡ *نفذها المطور كينج* ⟡─╯`
      : `╭───❖ 『 *تم الخصم منك* 』❖───╮\n\n➖ تم خصم *${amount}* نقطة من رصيدك\n📞 رقمك: *${targetId}*\n\n╰─⟡ *راجع حساباتك يا بطل!* ⟡─╯`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: confirmationText,
      mentions: mention ? [mention] : []
    }, { quoted: msg });
  }
};