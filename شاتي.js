const fs = require('fs');
const thumbnail = fs.readFileSync('./image.jpeg');

module.exports = {
  name: 'شاتي',
  command: ['شاتي'],
  category: 'أدوات',
  description: 'ينشئ رابط شات واتساب مع رقم المستخدم ويعرض صورة الجروب.',
  args: ['[النص الاختياري]'],
  execute: async (sock, m, args = []) => {
    try {
      // إرسال رسالة انتظار
      await sock.sendMessage(m.key.remoteJid, { text: '*جــــاري انــــشــاء اللـــينك الـخـاص بــك 🍷*' }, { quoted: m });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // استخراج رقم المستخدم (النخبة لو حبيت تضيفهم هنا)
      const senderJid = m.key.participant || m.participant || m.key.remoteJid;
      const userNumber = senderJid.split('@')[0];

      // استخراج النص بعد الأمر (يدعم args أو قراءة النص الكامل)
      let messageText = args.length > 0 ? args.join('+') : '';

      // رابط الشات
      const chatLink = `https://wa.me/${userNumber}${messageText ? `?text=${messageText}` : ''}`;

      // الحصول على صورة الجروب
      let profilePicUrl;
      try {
        profilePicUrl = await sock.profilePictureUrl(m.key.remoteJid, 'image');
      } catch {
        profilePicUrl = 'https://i.ibb.co/album/default-image.jpg'; // صورة افتراضية
      }

      // نص الرسالة المنسق
      const sectionsText = `*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┓*\n` +
        `*⛓️ لينك شاتك:*\n` +
        `> ${chatLink}\n\n` +
        `> تعال سولو اكبر زرافين فاهمين كيف مش زي الباقي.. ⛓️✈️\n` +
        `*┗┅ ━━━━━━━━━━━━━━━ ┅ ━┛*\n\n` +
        `> *  > 𝐁𝐎𝐓 𝑲𝑰𝑵𝑮 🫦 < *`;

      // إرسال الرسالة مع externalAdReply
      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: profilePicUrl },
          caption: sectionsText,
          contextInfo: {
            externalAdReply: {
              mediaUrl: chatLink,
              mediaType: 2,
              description: 'رابط شات واتساب الخاص بك',
              title: '𝑲𝑰𝑵𝑮 BOT ⚡',
            body: ' 𝑺𝑶𝑳𝑶 𝑳𝑰𝑵𝑲',
             thumbnail, 
              sourceUrl: chatLink
            }
          }
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("❌ خطأ أثناء إنشاء رابط الشات:", error);
      await sock.sendMessage(m.key.remoteJid, { text: '❌ حدث خطأ أثناء إنشاء الرابط.' }, { quoted: m });
    }
  }
};