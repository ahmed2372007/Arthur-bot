const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
  command: ['استدعاء'],
  category: 'انمي',
  description: 'طقوس استدعاء أي شخصية أنمي',
  usage: '.استدعاء [اسم]',

  async execute(sock, msg, args) {
    try {
      const name = args.join(' ').trim();
      const jid = msg.key.remoteJid;

      if (!name) {
        return sock.sendMessage(jid, { text: '👁️‍🗨️ اكتب اسم الشخصية بعد الأمر.\nمثال: `.استدعاء ايتاتشي`' });
      }

      const intro = `🔮 استدعاء *${name}* قيد التنفيذ...`;
      const quote = '🕯️ "أرواح الماضي لا تموت، بل تنتظر من يناديها."';

      // توليد صورة رمزية
      const imgUrl = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(name)}`;
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      await sock.sendMessage(jid, {
        image: buffer,
        caption: `${intro}\n\n${quote}`
      });

    } catch (err) {
      console.error('🚨 خطأ في أمر استدعاء:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تنفيذ الأمر.\n' + (err.message || 'تفاصيل غير معروفة.')
      });
    }
  }
};