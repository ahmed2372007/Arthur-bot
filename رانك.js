const { getUniqueKicked } = require('../haykala/dataUtils');
const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'رانك',
  description: 'يعرض رتبتك حسب عدد الزرف مع معلوماتك ومعلومات البوت بشكل أسطوري',
  category: 'zarf',
  usage: '.رانك',

  async execute(sock, msg) {
    try {
      const kickedSet = getUniqueKicked();
      const totalZarf = kickedSet.size;

      // رتب مع thresholds أكبر وجميلة
      const ranks = [
        { threshold: 0, title: '✦ مبتدئ ✦', emoji: '🪶' },
        { threshold: 25, title: '✦ جندي ✦', emoji: '🪖' },
        { threshold: 75, title: '✦ مقاتل ✦', emoji: '⚔️' },
        { threshold: 150, title: '✦ قناص ✦', emoji: '🎯' },
        { threshold: 300, title: '✦ قائد ✦', emoji: '🦾' },
        { threshold: 600, title: '✦ نقيب ✦', emoji: '🧠' },
        { threshold: 1200, title: '✦ زعيم ✦', emoji: '👑' },
        { threshold: 2400, title: '✦ ملك ✦', emoji: '🏰' },
        { threshold: 4800, title: '✦ أسطورة ✦', emoji: '🔥' },
        { threshold: 9600, title: '✦ أسطورة خارقة ✦', emoji: '⚡' },
        { threshold: 19200, title: '✦ كيان مظلم ✦', emoji: '🌑' },
        { threshold: 38400, title: '✦ خالِد ✦', emoji: '🌀' },
        { threshold: 76800, title: '✦ فوق الطبيعة ✦', emoji: '🌌' },
        { threshold: 153600, title: '✦ سيد الأكوان ✦', emoji: '👽' },
        { threshold: 307200, title: '✦ مجهول الهوية ✦', emoji: '🧿' },
        { threshold: 614400, title: '✦ نهاية كل شيء ✦', emoji: '💀' },
        { threshold: 1228800, title: '✦ ∞ نهاية الزرف ∞ ✦', emoji: '♾️' }
      ];

      // تحديد الرتبة المناسبة حسب عدد الزرف
      let rank = ranks[0];
      for (let i = ranks.length - 1; i >= 0; i--) {
        if (totalZarf >= ranks[i].threshold) {
          rank = ranks[i];
          break;
        }
      }

      // معلومات المستخدم
      const sender = msg.key.participant || msg.key.remoteJid; // رقم المستخدم
      const userId = extractPureNumber(sender);
      const userName = msg.pushName || 'لا يوجد اسم';

      // معلومات البوت (ممكن تضيف أكثر لو تحب)
      const botName = sock.user?.name || 'البوت';
      const botId = extractPureNumber(sock.user?.id || '0000');

      // رسالة فخمة مزخرفة
      const message = `
╔══════════════╗
║  ✨ 𝐙𝐀𝐑𝐅 𝐑𝐀𝐍𝐊 ✨
╚══════════════╝

🌟 الاسم : ${userName}
🔢 الرقم : +${userId}

🏅 الرتبة : ${rank.title} ${rank.emoji}
💥 عدد الزرف : ${totalZarf} 🧨

🤖 اسم البوت : ${botName}
🆔 معرف البوت : ${botId}

❝ استمر في الزرف لتصل إلى قمم جديدة! ❞
`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: message.trim()
      }, { quoted: msg });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء جلب الرانك، حاول مرة أخرى.'
      }, { quoted: msg });
    }
  }
};