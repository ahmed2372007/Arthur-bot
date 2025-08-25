module.exports = {
  command: 'غادر',
  description: 'يغادر البوت المجموعة (النخبة فقط)',
  usage: 'غادر',
  category: 'group',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, {
        text: '❌ هذا الأمر يعمل فقط داخل المجموعات.'
      }, { quoted: msg });
    }

    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderNum = senderJid.split('@')[0];

    console.log('رقم المُرسل:', senderNum); // ✅ ستعرف الرقم الحقيقي هنا

    const eliteNumbers = ['201013954763']; // ← تأكد أنه نفس الرقم الظاهر في الترمكس

    if (!eliteNumbers.includes(senderNum)) {
      return sock.sendMessage(jid, {
        text: '❌ هذا الأمر مخصص للنخبة فقط.'
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, { text: '🚪 جارٍ مغادرة المجموعة بأمر من النخبة...' }, { quoted: msg });
    await sock.groupLeave(jid);
  }
};