// plugins/bot.js
module.exports = {
  command: 'بوت',
  description: 'يعرض فيديو ترحيبي وزر الأوامر بأسلوب ملكي مرعب',
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    await sock.sendMessage(jid, {
      video: { url: 'https://files.catbox.moe/qdjiqw.mp4' },
      caption: `╭━━〔𝑺𝑼𝑲𝑼𝑵𝑨😈〕━━⬣
│👤 الاسم: *امريكي//American*
│🫦 الحالة: عاوزين نسوان🫦
│✈️ السرعة: اسرع من خيالك جيب ادمن تشوف😈
│⛓️ المطور: امريكي 
│⚡ جاهز يا باشا🫦
╰━━〔 𝑺𝑼𝑲𝑼𝑵𝑨 〕━━⬣`*,
      buttons: [
        {
          buttonId: 'commands',
          buttonText: { displayText: '𝑲𝑰𝑵𝑮' },
          type: 1
        }
      ],
      headerType: 5,
    }, { quoted: msg });
  }
};