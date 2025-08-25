module.exports = {
  command: 'تقييم',
  description: 'يعطي تقييم عشوائي ساخر لأي شخص',
  usage: '.تقييم @فلان',
  category: 'تسلية',
  async execute(sock, msg) {
    try {
      let args = msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.mentionedJid;
      if (!args) args = [];
      const name = args[0] || 'أنت';
      const rating = Math.floor(Math.random() * 101); // 0 - 100
      let comment = '';

      if (rating <= 10) comment = '💩 انت فضيحة تمشي على قدمين.';
      else if (rating <= 25) comment = '😬 حاول ترجع للنسخة التجريبية من نفسك.';
      else if (rating <= 40) comment = '🤡 قريب تكون إنسان، باقيلك شوي.';
      else if (rating <= 60) comment = '🙂 لا ممتاز ولا زبالة، نص نص.';
      else if (rating <= 75) comment = '😎 فيك لمحة فخامة، بس لا تفرح كثير.';
      else if (rating <= 90) comment = '🔥 محترم، بس لا تنغر بنفسك.';
      else if (rating <= 99) comment = '👑 انت أسطورة تمشي، بس ناقصك تاج.';
      else comment = '🚀 انت فوق البشر… بس بتبقى تحتي حب.';

      await sock.sendMessage(msg.key.remoteJid, {
        text: `📊 تقييم ${name}: ${rating}%\n\n${comment}`,
        quoted: msg,
      });
    } catch (error) {
      console.error('❌ خطأ في أمر تقييم:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message || error.toString()}`,
      }, { quoted: msg });
    }
  },
};