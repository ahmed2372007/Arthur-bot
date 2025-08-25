const elite = require('./haykala/elite');

module.exports = {
  command: 'شاهد',
  description: 'تفاعل مع شخص ما في الدردشة',
  usage: '.شاهد <@user>',
  category: 'تسلية',
  async execute(m, { conn, text }) {
    try {
      const allowedUsers = elite;
      if (!allowedUsers.includes(m.sender)) {
        return conn.sendMessage(m.chat, {
          text: '*شوف حد ينيكك*',
        }, { quoted: m });
      }
      let mentionedUser;
      if (m.quoted) {
        mentionedUser = m.quoted.sender;
      } else if (text && text.includes('@')) {
        mentionedUser = text.match(/@\d+/g)[0].replace('@', '') + '@s.whatsapp.net';
      } else {
        throw '*❌ قم بالرد على الشخص أو قم بمنشن الشخص الذي تريد التفاعل معه*';
      }
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const messages = [
        `*@${mentionedUser.split('@')[0]} عامل اي*`,
        `*@${mentionedUser.split('@')[0]} امك عاملة اي*`,
        `*@${mentionedUser.split('@')[0]} سلملي علي امك وقولها متنسيش بكرا ها*`,
        `*@${mentionedUser.split('@')[0]} انا زهقت منك انطر يكسمك*`,
      ];
      for (let msg of messages) {
        await delay(3000);
        await conn.sendMessage(m.chat, {
          text: msg,
          mentions: [mentionedUser],
        }, { quoted: m });
      }
      await conn.groupParticipantsUpdate(m.chat, [mentionedUser], 'remove');
    } catch (e) {
      console.error('حدث خطأ:', e);
      throw '*❌ حدث خطأ أثناء التفاعل مع الشخص. يرجى المحاولة مرة أخرى.*';
    }
  },
};