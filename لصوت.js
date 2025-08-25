const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// إطار مزخرف للردود
const decorate = (text) => `❴✾❵──━━━━❨🍷❩━━━━──❴✾❵\n*${text}*\n❴✾❵──━━━━❨🍷❩━━━━──❴✾❵`;

module.exports = {
  command: 'لصوت',
  description: 'يحوّل فيديو إلى تسجيل صوتي.',
  async execute(sock, m) {
    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const quotedMsg = contextInfo?.quotedMessage?.videoMessage;

      if (!quotedMsg) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: decorate('📼 يرجى الرد على فيديو لتحويله إلى صوت.')
        }, { quoted: m });
      }

      const stream = await downloadContentFromMessage(quotedMsg, 'video');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      if (!buffer.length) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: decorate('❌ فشل تحميل الفيديو.')
        }, { quoted: m });
      }

      const inputPath = path.join(__dirname, 'temp-video.mp4');
      const outputPath = path.join(__dirname, 'temp-audio.mp3');

      fs.writeFileSync(inputPath, buffer);

      // تحويل الفيديو إلى صوت باستخدام ffmpeg
      exec(`ffmpeg -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`, async (error) => {
        if (error) {
          console.error(error);
          return await sock.sendMessage(m.key.remoteJid, {
            text: decorate('❌ حدث خطأ أثناء تحويل الفيديو.')
          }, { quoted: m });
        }

        const audioBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(m.key.remoteJid, {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          ptt: true
        }, { quoted: m });

        // تنظيف الملفات
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: decorate('❌ حدث خطأ أثناء معالجة الأمر.')
      }, { quoted: m });
    }
  }
};