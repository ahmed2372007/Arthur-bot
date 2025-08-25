const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, '../data/points.json');

function loadPoints() {
  if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, '{}');
  return JSON.parse(fs.readFileSync(pointsFile));
}

module.exports = {
  command: 'المتصدرين',
  description: '🏆 عرض أعلى 5 لاعبين بالنقاط',
  usage: '.المتصدرين',
  category: 'نقاط',

  async execute(sock, msg) {
    const points = loadPoints();
    const sorted = Object.entries(points)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 لا يوجد لاعبين في المتصدرين بعد!'
      }, { quoted: msg });
    }

    const تصنيفات = (score) => {
      if (score >= 1000000000) return '🏆 سيد الأساطير 🏆';
      if (score >= 1000000) return '🧙‍♂️ حكيم النقاط';
      if (score >= 500000) return '🔥 ملهم التحدي';
      if (score >= 100000) return '👑 ملك النقاط';
      if (score >= 50000) return '💎 نجم متألق';
      if (score >= 10000) return '🥇 بطل خارق';
      if (score >= 5000) return '🥈 مقاتل محترف';
      if (score >= 1000) return '🥉 مجتهد';
      if (score >= 500) return '🌟 مبتدئ قوي';
      if (score >= 100) return '🪴 مبتدئ';
      return '🌱 مبتدئ جداً';
    };

    const rankEmoji = ['🥇', '🥈', '🥉', '🏅', '🎖️'];

    let result = `╭───❖ *𝗧𝗢𝗣 𝟱 𝗣𝗟𝗔𝗬𝗘𝗥𝗦* ❖───╮\n`;

    for (let i = 0; i < sorted.length; i++) {
      const [jid, score] = sorted[i];
      let realNumber;

      try {
        const info = await sock.onWhatsApp(jid.includes('@') ? jid : jid + '@s.whatsapp.net');
        realNumber = info?.[0]?.jid?.split('@')[0] || jid;
        if (realNumber.startsWith('20')) realNumber = '0' + realNumber.slice(2); // مصر
      } catch (e) {
        realNumber = jid.split('@')[0];
      }

      result += `\n${rankEmoji[i] || '⭐'} *${realNumber}*\n` +
                `➥ النقاط: *${score}*\n` +
                `➥ التصنيف: ${تصنيفات(score)}\n`;
    }

    result += `\n╰─⟡ *واصل اللعب وتصدر الترتيب!* ⟡─╯`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: result
    }, { quoted: msg });
  }
};