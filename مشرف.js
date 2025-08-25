const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'مشرف',
  category: 'ادارة',
  description: 'طرد العضو اللي تم الرد عليه أو منشنه مع رسالة زرف',

  async execute(sock, msg, args = []) {
    try {
      const groupJid = msg.key.remoteJid;

      if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, { text: '❌ هذا الأمر يعمل فقط داخل القروبات.' }, { quoted: msg });
      }

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      let target;

      if (quotedMsg?.participant) {
        target = quotedMsg.participant;
      } else if (mentions.length > 0) {
        target = mentions[0];
      } else {
        return sock.sendMessage(groupJid, { text: '❌ من فضلك رد على العضو أو امنشنه لطرده.' }, { quoted: msg });
      }

      // منع طرد البوت نفسه أو المشرف
      const metadata = await sock.groupMetadata(groupJid);
      const isAdmin = metadata.participants.find(p => p.id === target)?.admin;

      if (isAdmin === 'admin' || isAdmin === 'superadmin') {
        return sock.sendMessage(groupJid, { text: '🚫 لا يمكن طرد مشرف.' }, { quoted: msg });
      }

      await sock.groupParticipantsUpdate(groupJid, [target], 'remove');

      return sock.sendMessage(groupJid, {
        text: `🧹 تم طرد عاها \n📤 انتهى وقتك يا نجم.`,
        mentions: [target]
      }, { quoted: msg });

    } catch (err) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};