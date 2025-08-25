module.exports = {
  command: 'برا',
  description: 'يطرد العضو من الجروب (للمشرفين فقط)',
  category: 'admin',
  usage: '.برا @',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // التأكد أن الرسالة في جروب
    if (!jid.endsWith('@g.us')) {
      return await sock.sendMessage(jid, {
        text: '⚠️ هذا الأمر يستخدم فقط في الجروبات.\n\n- كينج '
      }, { quoted: msg });
    }

    // تحقق من أن المرسل مشرف في الجروب
    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      if (!admins.includes(sender)) {
        return await sock.sendMessage(jid, {
          text: '🚫 هذا الأمر للمشرفين فقط.\n\n- كينج'
        }, { quoted: msg });
      }
    } catch (e) {
      return await sock.sendMessage(jid, {
        text: '⚠️ حدث خطأ أثناء التحقق من المشرفين.\n\n- كينج'
      }, { quoted: msg });
    }

    // جلب الشخص الممنشن
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mention || mention.length === 0) {
      return await sock.sendMessage(jid, {
        text: '⚠️ منشن الشخص اللي تبي تطرده.\n\n- كينج'
      }, { quoted: msg });
    }

    const target = mention[0];

    try {
      // تنفيذ الطرد
      await sock.groupParticipantsUpdate(jid, [target], 'remove');

      // رسالة تأكيد
      await sock.sendMessage(jid, {
        text: `✅ تم طرد العضو بنجاح.\nبرا زي الكلب 🐶\n\n- كينج`
      });
    } catch (err) {
      console.error('❌ خطأ في تنفيذ أمر برا:', err.message);
      await sock.sendMessage(jid, {
        text: '⚠️ فشل تنفيذ الأمر، تأكد أن لدي البوت صلاحيات كافية.\n\n- كينج'
      }, { quoted: msg });
    }
  }
};