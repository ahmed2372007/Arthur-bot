const { eliteNumbers } = require('../haykala/elite.js'); // تأكد من المسار الصحيح

module.exports = {
  command: 'تجديد',
  description: 'تغيير رابط المجموعة (للمشرفين فقط).',
  usage: 'رابط',
  category: 'إدارة',
  async execute(sock, message) {
    try {
      const chatId = message.key.remoteJid;
      const senderJid = message.key.participant;
      
      const metadata = await sock.groupMetadata(chatId);
      const participants = metadata.participants;
      const sender = participants.find(p => p.id === senderJid);

      if (!sender || (sender.admin !== 'admin' && sender.admin !== 'superadmin')) {
        return await sock.sendMessage(chatId, { text: '🚫 هذا الأمر متاح للمشرفين فقط.' }, { quoted: message });
      }

      // إعادة تعيين رابط الدعوة
      const newInviteCode = await sock.groupRevokeInvite(chatId);
      const groupLink = `https://chat.whatsapp.com/${newInviteCode}`;

      await sock.sendMessage(chatId, {
        text: `✅ تم تغيير رابط المجموعة:\n${groupLink}`,
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ أثناء تنفيذ أمر تغيير رابط المجموعة:', error);
      return await sock.sendMessage(chatId, { text: '⚠️ حدث خطأ أثناء تغيير رابط المجموعة. يرجى المحاولة لاحقًا.' }, { quoted: message });
    }
  }
};