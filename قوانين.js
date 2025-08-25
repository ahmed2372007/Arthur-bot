module.exports = {
  command: 'قوانين',
  description: 'عرض قوانين النقابة',
  usage: 'قوانين',
  category: 'عام',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ هذا الأمر خاص بالمجموعات فقط.' }, { quoted: msg });
      }

      const rulesText = `
*╚═══ஓ๑🎃๑ஓ═══╝*

*⸙┇القوانين┇📜┇≫*

> *✪ بلاش هبد كثير القوانين بسيطه :*
- احترم = تحترم
يعني ؟
تسب تهايط تنشر روابط ترسل اي شي +18 ترسل اي شي مش محترم تروح خاص لولد او بنت تطلب إشراف = تتهان.

*╚═══ஓ๑🛡️๑ஓ═══╝*

*توقيع : 𝑲𝑰𝑵𝑮 𝐄𝐒𝐂𝐀𝐍𝐎𝐑*`;

      await sock.sendMessage(chatId, { text: rulesText }, { quoted: msg });

    } catch (error) {
      console.error('خطأ في أمر القوانين:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: msg });
    }
  }
};