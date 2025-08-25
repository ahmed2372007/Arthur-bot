module.exports = {
  command: 'سبا',
  category: 'ادوات',
  description: 'يرد على رسالة ويبعتها عدد معين من المرات (حد أقصى 1000)',

  async execute(sock, msg, args = []) {
    try {
      const groupJid = msg.key.remoteJid;

      if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, {
          text: '❌ هذا الأمر يعمل فقط داخل القروبات.'
        }, { quoted: msg });
      }

      // التأكد إنه رد على رسالة
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        return sock.sendMessage(groupJid, {
          text: '❌ من فضلك رد على الرسالة اللي عايز تعمل لها سبام.\nمثال: `.سبا 5`'
        }, { quoted: msg });
      }

      // جلب العدد من نص الأمر نفسه بعد البريفكس
      const fullCommand = msg.message?.extendedTextMessage?.text || '';
      const count = parseInt(fullCommand.trim().split(' ')[1]);

      if (isNaN(count) || count < 1) {
        return sock.sendMessage(groupJid, {
          text: '❌ من فضلك حدد عدد مرات السبام.\nمثال: `.سبا 10`'
        }, { quoted: msg });
      }

      if (count > 1000) {
        return sock.sendMessage(groupJid, {
          text: '🚫 الحد الأقصى للسبام هو 1000 مرة فقط.'
        }, { quoted: msg });
      }

      // إرسال الرسالة المحددة بنفس النوع
      const contextKey = msg.message.extendedTextMessage.contextInfo;

      for (let i = 0; i < count; i++) {
        await sock.sendMessage(groupJid, {
          forward: {
            key: {
              remoteJid: groupJid,
              fromMe: false,
              id: contextKey.stanzaId,
              participant: contextKey.participant
            },
            message: quoted
          }
        });
      }

    } catch (err) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};