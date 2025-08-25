// 🫦
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'حماس',
  description: 'يرسل مقطع صوتي حماسي عشوائي',
  category: 'صوتيات',
  usage: '.حماس',
  async execute(sock, msg) {
    const soundDir = path.join(__dirname, '..', 'sounds');
    const files = ['hamas_1.mp3', 'hamas_2.mp3', 'hamas_3.mp3', 'hamas_4.mp3', 'hamas_5.mp3'];
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(soundDir, randomFile);

    if (!fs.existsSync(filePath)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ لم يتم العثور على المقاطع الصوتية المطلوبة.',
      }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: msg });
  }
};