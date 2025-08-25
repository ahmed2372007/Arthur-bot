const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js'); // استيراد أرقام النخبة

module.exports = {
  command: 'امريكي',
  description: 'رد مخصص على كلمة كينج ',
  category: 'fun',

  async execute(sock, msg) {
    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      // استخراج الرقم فقط من الجيد
      const senderNumber = (jidDecode(senderJid)?.user || senderJid.split('@')[0]).replace(/^0+/, '').replace(/^\+/, '');

      // تحقق هل المرسل من النخبة
      const isElite = eliteNumbers.some(num => senderNumber.endsWith(num));

      // الرسائل التي سيرد بها البوت
      const ownerReply = `- *𖤐 انا امريكي يولاد المره انتو مين☝🫦*`;

      const othersReply = `دز يالعبد زنجي تراك مب عمو كينج 🦶🏾`;

      const replyText = isElite ? ownerReply : othersReply;

      await sock.sendMessage(msg.key.remoteJid, { text: replyText }, { quoted: msg });
    } catch (error) {
      console.error('Error in كينج command:', error);
    }
  }
};