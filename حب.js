module.exports = {
  command: 'حب',
  description: '💘 اكتشف نسبة الحب بينك وبين شخص آخر!',
  category: 'ترفيه',
  usage: '.حب @العضو',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const senderName = msg.pushName || 'أنت';

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const mentions = contextInfo?.mentionedJid;

    if (!mentions || mentions.length === 0) {
      return sock.sendMessage(chatId, {
        text: '👀 منشن حد كده عشان أقولك بيحبك قد إيه!\nمثال: *.حب @العضو*',
      }, { quoted: msg });
    }

    const targetJid = mentions[0];
    const percent = Math.floor(Math.random() * 101); // 0 - 100
    let reaction = '';

    if (percent >= 75) {
      reaction = '❤️‍🔥 دي علاقة حب عظيمة! في طريقكم للجواز 😂💍';
    } else if (percent >= 40) {
      reaction = '💞 في مشاعر بس محتاجة شوية اهتمام أكتر 🥺';
    } else {
      reaction = '💔 للأسف مش بيحبك كده أوي... خليك قوي! 😔';
    }

    await sock.sendMessage(chatId, {
      text: `
❤️ *نسبة الحب بينكم: ${percent}%*

📌 *${senderName}* ❤️ *@${targetJid.split('@')[0]}*

${reaction}
      `,
      mentions: [targetJid]
    }, { quoted: msg });
  }
};