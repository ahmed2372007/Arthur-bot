//
// import أرقام النخبة
const elite = require('../haykala/elite');

module.exports = {
  command: ['سبه'],
  description: 'سب',
  category: 'tools',
  async execute(sock, msg) {
    try {
      const sender = msg.key.participant || msg.key.remoteJid;
      const eliteList = elite || [];

      // التحقق إذا المستخدم من النخبة
      if (!eliteList.includes(sender)) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ هذا الأمر مخصص للنخبة فقط.',
        }, { quoted: msg });
      }

      // جلب رقم الشخص من الرد أو المنشن
      const context = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentionedJid = context.mentionedJid || [];
      const replyJid = context.participant || '';

      if (!mentionedJid.length && !replyJid) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '> يرجى رد او منشن الشخص الذي تريد سبّه 🫦.',
        }, { quoted: msg });
      }

      const targetJid = mentionedJid[0] || replyJid;
      const targetNumber = targetJid.split('@')[0];

      await sock.sendMessage(msg.key.remoteJid, {text: `@${targetNumber} \n\nابعد عن مطوري يا كسمك 🐦`,
        mentions: [targetJid],
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في أمر سبه:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تنفيذ الأمر.',
      }, { quoted: msg });
    }
  }
};