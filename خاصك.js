// 🫦
module.exports = {
  command: ['خاصك'],
  description: 'يرسل رسالة خاصة للشخص المحدد بالرد أو بالمنشن.',
  category: 'أدوات',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetId = null;
    let message = args.join(' ');

    // إذا فيه رد على رسالة
    if (quotedMsg) {
      targetId = msg.message.extendedTextMessage.contextInfo.participant;
      if (!message) message = "مرحبا"; // رسالة افتراضية إذا ما كتبت شيء
    }
    // إذا فيه منشن
    else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
      targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      if (!message) message = "مرحبا"; // رسالة افتراضية إذا ما كتبت شيء
    }

    if (!targetId) {
      await sock.sendMessage(chatId, { text: '❌ لازم ترد أو تمنشن الشخص!' }, { quoted: msg });
      return;
    }

    await sock.sendMessage(targetId, { text: message });
    await sock.sendMessage(chatId, { text: '✅ تم ارسال الرسالة!' }, { quoted: msg });
  }
};