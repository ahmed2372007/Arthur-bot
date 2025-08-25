const fs = require('fs');
const path = require('path');
const pointsFile = path.join(__dirname, '../data/points.json');

function loadPoints() {
  if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, '{}');
  return JSON.parse(fs.readFileSync(pointsFile));
}

function getRank(score) {
  if (score >= 10000) return '🏆 سيد الأساطير';
  if (score >= 5000) return '👑 ملك النقاط';
  if (score >= 2000) return '🔥 أسطورة ملحمية';
  if (score >= 1000) return '🥇 بطل خارق';
  if (score >= 600)  return '🥈 مقاتل محترف';
  if (score >= 300)  return '🥉 لاعب قوي';
  if (score >= 150)  return '🏅 واعد';
  if (score >= 50)   return '🎖️ مبتدئ جيد';
  return '🌱 مبتدئ جداً';
}

module.exports = {
  command: 'رصيدي',
  description: '📊 يظهر عدد نقاطك الحالية',
  usage: '.رصيدي',
  category: 'نقاط',

  async execute(sock, msg) {
    const sender = (msg.key.participant || msg.key.remoteJid).replace(/[^0-9]/g, '');
    const points = loadPoints();
    const score = points[sender] || 0;

    const name = msg.pushName || 'مستخدم';
    const rank = getRank(score);

    const text = `╭───❖ 『 *📊 رصيدك الحالي* 』❖───╮

👤 الاسم: *${name}*
💰 النقاط: *${score}*
🏆 التصنيف: ${rank}

🎮 استمر في اللعب لتتقدم في الترتيب!

╰─⟡ 𝑩𝛩𝑻 - 𝑲𝑰𝑵𝑮⟡─╯`;

    await sock.sendMessage(msg.key.remoteJid, {
      text
    }, { quoted: msg });
  }
};