module.exports = {
  command: 'جمال',
  description: '💅 نسبة الجمال عندك أو عند شخص آخر',
  usage: '.جمال [منشن]',
  category: 'ترفيه',

  async execute(sock, msg) {
    let targetJid;

    if (
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid &&
      msg.message.extendedTextMessage.contextInfo.mentionedJid.length > 0
    ) {
      targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else {
      targetJid = msg.key.participant || msg.key.remoteJid;
    }

    const percentage = Math.floor(Math.random() * 101);
    const targetId = targetJid.split('@')[0];

    await sock.sendMessage(msg.key.remoteJid, {
      text: `💅 نسبة الجمال عند *@${targetId}*: *${percentage}%*\n\n🌟 الجاذبية ساحقة ولا نحتاج فلتر؟`,
      mentions: [targetJid]
    }, { quoted: msg });
  }
};