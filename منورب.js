const { getProfilePicture } = require("@whiskeysockets/baileys");

module.exports = {
  command: "منور",
  description: "رد ساخر على كلمات مثل منور ونورت",
  usage: ".منور",
  category: "fun",

  async execute(sock, msg) {
    try {
      const replies = [
        "منور؟ دا النور اتطفى لما دخلت 🌚",
        "منور على أساس إنك نجفة؟ 😂",
        "منوره؟ دا الكهربا قاطعة أصلاً 🪫",
        "نورت؟ انت مطفي والله 🕯️",
        "منورين؟ دا المكان كان منور قبلكم 😒",
        "النوَر خاف لما شافك، إنت ظلامي؟ 😳",
        "شكلك داخل بمبة مش نور 😆",
        "لو كل منور زيك، كنا عايشين في كوكب ظلمة 🌑",
        "خلي نورك لنفسك، إحنا بنحب العتمة 😜",
        "منور؟ دا إنت عامل ظلال مش نور ☁️"
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      // Get sender ID
      const senderId = msg.key.participant || msg.key.remoteJid;

      // Try to fetch sender's profile picture
      let pfp = null;
      try {
        pfp = await sock.profilePictureUrl(senderId, 'image');
      } catch (err) {
        // ignore if can't fetch
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: randomReply,
        contextInfo: {
          externalAdReply: {
            title: "✨ نورك عمى السيرفر",
            body: "رد ظريف من KING BOT 👑",
            thumbnailUrl: pfp,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error("❌ خطأ في أمر 'منور':", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حصل خطأ:\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};