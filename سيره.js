const stories = require('../data/seerahStories');

module.exports = {
  command: 'سيره',
  category: 'general',
  description: 'يعرض قصة عشوائية من السيرة النبوية.',
  usage: '.سيره',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const story = stories[Math.floor(Math.random() * stories.length)];

    await sock.sendMessage(chatId, {
      text: `📖 *قصة من السيرة النبوية:*\n\n${story}`,
    }, { quoted: msg });
  }
};