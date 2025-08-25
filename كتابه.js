
const characters = [
  "لوفي", "زورو", "ناروتو", "ساسكي", "غوكو", "فيجيتا", "ليفاي", "إيرين",
  "إيتاتشي", "مادارا", "إيتشيغو", "آيزن", "غون", "كيلوا", "تانجيرو", "نيزوكو",
  "غوجو", "كاكاشي", "هيناتا", "ناتسو", "غراي", "ساتورو", "ريمي", "سايتاما", "جينوس",
  "بوروتو", "ساكورا", "أوبيتو", "دازاي", "توجي", "يوتا"
  // يمكنك إضافة المزيد من الشخصيات هنا، وسأرسل لك لاحقًا ملف به 1000+ اسم إن أردت
];

module.exports = {
  command: 'كتابه',
  category: 'games',
  description: 'فعالية: من يكتب اسم الشخصية أولاً يفوز!',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;

    const selected = characters[Math.floor(Math.random() * characters.length)];

    await sock.sendMessage(chatId, {
      text: `🎮 *فعالية النسخ!*\n\n🧠 أول واحد يكتب اسم الشخصية التالية بشكل صحيح يفوز:\n\n🔤 *"${selected}"*\n\n⏱️ لديك *15 ثانية* فقط، انطلق!`,
    }, { quoted: msg });

    let answered = false;

    const handler = async ({ messages }) => {
      const reply = messages[0];
      const replyFrom = reply.key.remoteJid;

      if (
        replyFrom === chatId &&
        !reply.key.fromMe &&
        (reply.key.participant || reply.participant || reply.key.remoteJid) &&
        !answered
      ) {
        const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text;

        if (body && body.trim() === selected) {
          answered = true;
          await sock.sendMessage(chatId, {
            text: `🏆 ${reply.pushName || 'شخص ما'} كتب الاسم الصحيح أولاً!\n🎉 مبروك الفوز!`,
          }, { quoted: reply });
          sock.ev.off('messages.upsert', handler);
        }
      }
    };

    sock.ev.on('messages.upsert', handler);

    setTimeout(() => {
      if (!answered) {
        sock.sendMessage(chatId, {
          text: `❌ انتهى الوقت!\nالاسم الصحيح كان: *"${selected}"*`,
        }, { quoted: msg });
        sock.ev.off('messages.upsert', handler);
      }
    }, 15000);
  }
};