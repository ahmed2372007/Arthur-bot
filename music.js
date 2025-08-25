const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { tmpdir } = os;

module.exports = {
  command: 'اغنيه',
  description: 'تحميل أغنية MP3 من اليوتيوب',
  usage: '.اغنيه [اسم الاغنية]',
  category: 'media',

  async execute(sock, m) {
    try {
      const remoteJid = m.key.remoteJid;

      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

      const query = text.replace(/^[!.]?\s*اغنيه\s*/i, '').trim();

      if (!query || query.length < 2) {
        return await sock.sendMessage(remoteJid, {
          text: '🎵 من فضلك اكتب اسم الأغنية بعد الأمر.\nمثال: .اغنيه عبد الحليم جانا الهوى'
        }, { quoted: m });
      }

      const tempDir = tmpdir();
      const outputTemplate = path.join(tempDir, `audio-%(title)s.%(ext)s`);

      const command = `yt-dlp -x --audio-format mp3 --output "${outputTemplate}" "ytsearch1:${query}"`;

      await sock.sendMessage(remoteJid, { text: `🔍 جاري البحث عن: *${query}*` }, { quoted: m });

      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', error);
          return await sock.sendMessage(remoteJid, {
            text: '❌ خطأ في التحميل. تأكد من أن yt-dlp و ffmpeg مثبتين.'
          }, { quoted: m });
        }

        try {
          const files = fs.readdirSync(tempDir).filter(file => file.endsWith('.mp3'));
          if (!files.length) {
            return await sock.sendMessage(remoteJid, { text: '❌ لم أجد الملف الصوتي. حاول باسم آخر.' }, { quoted: m });
          }

          const audioPath = path.join(tempDir, files[0]);
          const audioBuffer = fs.readFileSync(audioPath);

          await sock.sendMessage(remoteJid, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false
          }, { quoted: m });

          try { fs.unlinkSync(audioPath); } catch (e) {}

        } catch (sendError) {
          console.error('Send error:', sendError);
          await sock.sendMessage(remoteJid, { text: '❌ خطأ أثناء إرسال الملف.' }, { quoted: m });
        }
      });

    } catch (error) {
      console.error('Main error:', error);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ حدث خطأ غير متوقع: ' + (error.message || error.toString())
      }, { quoted: m });
    }
  }
};