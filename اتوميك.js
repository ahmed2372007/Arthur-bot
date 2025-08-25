module.exports = {
  command: 'عمك',
  description: 'تعريف احترافي ببوت واتساب Sukuna.',
  category: 'عام',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    const caption = `
🤖︙*مرحبا في كينج بوت!*

✨ Sukuna هو بوت واتساب احترافي تم تطويره ليمنحك تجربة مميزة مليئة بالمتعة، الحماية، والذكاء.

🛡️︙يحتوي على أنظمة حماية متقدمة للجروبات.
🎮︙ألعاب تفاعلية، مسابقات، وفعاليات ممتعة.
📌︙أوامر إدارية وتنظيمية تساعدك على التحكم الكامل.

👑︙تم تطويره بعناية بواسطة: *Sukuna↵*

🚀︙نحن لا نقدّم مجرد بوت... بل تجربة متكاملة من السرعة، الأمان، والتفاعل.

━ ━ ━ ━ ━ ━
⚙️ *البوت: ⚙️┋Sukuna 𝑩❍𝑻 ┋⚙️*
🧪 *الإصدار: 3.2*
👤 *المطور: سوكونا*
━ ━ ━ ━ ━ ━
    `.trim();

    await sock.sendMessage(chatId, {
      video: { url: 'https://files.catbox.moe/dhlfet.mp4' },
      caption,
      mimetype: 'image.jpeg',
    }, { quoted: msg });
  }
};