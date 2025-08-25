//
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['قصيدة'],
  description: 'يرسل قصيدة بصوت عشوائي',
  category: 'تسلية',
  async execute(sock, msg) {
    try {
      const soundsDir = path.join(__dirname, '..', 'sounds');
      const files = [
        'DJIHAD_1.mp3',
        'DJIHAD_2.mp3',
        'DJIHAD_3.mp3',
        'DJIHAD_4.mp3',
        'DJIHAD_5.mp3',
        'DJIHAD_6.mp3',
        'DJIHAD_7.mp3',
        'DJIHAD_8.mp3',
        'DJIHAD_9.mp3',
        'DJIHAD_10.mp3',
        'DJIHAD_11.mp3',
      ];

      const selected = files[Math.floor(Math.random() * files.length)];
      const filePath = path.join(soundsDir, selected);
      const audioBuffer = fs.readFileSync(filePath);

      await sock.sendMessage(msg.key.remoteJid, {
        audio: audioBuffer,
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: msg });
    } catch (err) {
      console.error('خطأ في أمر القصيدة:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء إرسال القصيدة.'
      }, { quoted: msg });
    }
  }
};