module.exports = {
  name: 'تفاعل',
  command: ['تفاعل'],
  category: 'التفاعل',
  description: 'يرد البوت برد فعل على الرسالة التي ردت عليها',
  args: [],
  async execute(sock, msg) {
    try {
      const reaction = msg.body.slice(1);

      if (!reaction) return;

      const quotedMsg = await sock.getMessage(msg.key.remoteJid, msg.msg.extendedTextMessage.contextInfo.quotedMessageId);

      if (!quotedMsg) return;

      try {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: reaction,
            key: quotedMsg.key,
          },
        });
      } catch (error) {
        console.error('❌ لا يمكن إرسال رد الفعل، قد يكون وضع المسؤول فقط مفعلاً:', error);
      }
    } catch (error) {
      console.error('خطأ في أمر تفاعل:', error);
    }
  },
};