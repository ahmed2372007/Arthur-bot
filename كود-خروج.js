const { eliteNumbers } = require('../haykala/elite.js');

module.exports = {
  command: ['اطلع'],
  description: 'إخراج البوت من المجموعة.',
  category: 'نخبة',

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return await sock.sendMessage(jid, { text: '🚫 هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
    }

    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];

    if (!eliteNumbers.includes(sender) && !eliteNumbers.includes(senderNumber)) {
      return await sock.sendMessage(jid, {
        text: '> هــذا الامـــر مخــصص للمـــطور.... 💤 ',
      }, { quoted: msg });
    }

    // رد فعل تفاعل 🤫
    await sock.sendMessage(jid, {
      react: {
        text: '🤫',
        key: msg.key,
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // إرسال صورة مع رسالة وداع
    const imageUrl = 'https://i.pinimg.com/736x/2f/c1/fc/2fc1fc7bea93f5b93a5d0d817a2bc7c8.jpg';
    const farewellMessage = '> دزو مجموعه ما كان لها فائده مع السلامه ي شويت هوبل 😆....';

    await sock.sendMessage(jid, {
      image: { url: imageUrl },
      caption: farewellMessage,
    }, { quoted: msg });

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      await sock.groupLeave(jid);
      console.log('✅ خرج البوت من المجموعة');
    } catch (err) {
      console.error('❌ فشل الخروج من المجموعة:', err);
      await sock.sendMessage(jid, { text: '❌ فشل الخروج من المجموعة.' }, { quoted: msg });
    }
  }
};