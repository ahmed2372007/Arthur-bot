module.exports = {
  command: 'استخارة',
  description: '🕌 دعاء الاستخارة مع صوت',
  usage: '.استخارة',
  category: 'ديني',

  async execute(sock, msg) {
    const text = `
📿 *دعاء الاستخارة*:

اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ...

(اقرأه بعد ركعتين بنية الاستخارة)

🎧 *استمع للدعاء الآن:*
`.trim();

    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: 'https://islamic-dl.pages.dev/audio/istikharah.mp3' },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: msg });
  }
};