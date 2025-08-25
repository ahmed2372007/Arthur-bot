module.exports = {
  command: ['معا'], // يشتغل فقط لما تكتب .معا
  description: 'رسالة الخير والفيديو المرفق',
  usage: 'معا',
  category: 'تفاعلي',
  async execute(sock, msg, args) {
    const videoUrl = 'https://files.catbox.moe/vt4e2v.mp4';

    const caption = `🥹💛 زيت جونسون *معا للخير*\nهو الراعي الأول للخير\nنحن نحب الخير لغيرنا\nحب الغير هو الأولوية\nمعا لنشر الخير\n✨ شعارنا هو : *نحب الخير للغير*`;

    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: videoUrl },
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: msg });
  }
};