module.exports = {
  command: ['المتصلين'],
  category: 'group',
  description: 'عرض الأعضاء المتصلين الآن فعليًا (محدود)',
  usage: '.المتصلين',

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;

      const group = await sock.groupMetadata(jid);
      const members = group.participants.map(p => p.id).slice(0, 10); // أول 10 فقط
      const onlineNow = [];

      for (let user of members) {
        await sock.presenceSubscribe(user);
        await new Promise(resolve => setTimeout(resolve, 100)); // منع الحظر

        const presence = sock.presence?.[user];
        const isOnline = presence && presence.lastKnownPresence === 'available';

        if (isOnline) onlineNow.push(user);
      }

      const list = onlineNow.length
        ? onlineNow.map((k, i) => `*${i + 1}.* @${k.split('@')[0]}`).join('\n')
        : '❌ لا يوجد أعضاء أونلاين الآن (من أول 10 فقط).';

      await sock.sendMessage(jid, {
        react: { text: '🟢', key: msg.key },
      });

      await sock.sendMessage(jid, {
        text: `🟢 *المتصلين حاليًا (من بين أول 10 فقط):*\n\n${list}`,
        mentions: onlineNow,
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في أمر المتصلين:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حدث خطأ أثناء محاولة التحقق من المتصلين.',
      }, { quoted: msg });
    }
  }
};