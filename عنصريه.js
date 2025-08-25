module.exports = {
  command: ['عنصريه'],
  description: 'يرد برد شايف حاله على شخص معين',
  category: 'مزح',

  async execute(sock, msg) {
    const mention = msg.mentionedJid?.[0];
    const name = mention ? mention.split('@')[0] : null;

    if (!mention) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❗ لازم تعمل منشن.\nمثال: عنصريه @شخص',
      });
    }

    const ردود = [
      `😏 شوف مين... ${name}، نسخة بشرية فاشلة.`,
      `🤡 ${name}؟ حتى الذكاء الصناعي يتحاشاك.`,
      `📉 حتى السيرفرات رفضتك يا ${name}.`,
      `👑 ${name}؟ أنا ما بتعامل مع الفئة المطفية.`,
      `😂 مجرد وجودك يقلل من ذكاء المجموعة.`,
    ];

    const عشوائي = ردود[Math.floor(Math.random() * ردود.length)];

    await sock.sendMessage(msg.key.remoteJid, {
      text: عشوائي,
      mentions: [mention],
    });
  }
};