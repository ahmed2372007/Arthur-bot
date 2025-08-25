const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// الرسالة المزخرفة
const decorate = text => `╭────⪧\n🍷 *${text}*\n╰────⪦`;

module.exports = {
  command: 'قص',
  async execute(sock, m) {
    try {
      const body = m.message?.extendedTextMessage?.text || m.message?.conversation || '';
      const duration = parseInt(body.replace(/^\.\s*قص/i, '').trim());

      if (isNaN(duration) || duration < 1) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: decorate('⏱️ حدد مدة صحيحة بالثواني. مثال: .قص 15'),
        }, { quoted: m });
      }

      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const quoted = contextInfo?.quotedMessage;
      const video = quoted?.videoMessage;
      const audio = quoted?.audioMessage;

      if (!quoted || (!video && !audio)) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: decorate('🎬 رد على فيديو أو صوت لاستخدام الأمر.'),
        }, { quoted: m });
      }

      const type = video ? 'video' : 'audio';
      const content = video || audio;
      const stream = await downloadContentFromMessage(content, type);
      let buffer = Buffer.from([]);

      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const inputExt = type === 'video' ? 'mp4' : 'mp3';
      const outputExt = type === 'video' ? 'mp4' : 'mp3';
      const inputPath = path.join(__dirname, `clip-input.${inputExt}`);
      const outputPath = path.join(__dirname, `clip-output.${outputExt}`);

      fs.writeFileSync(inputPath, buffer);

      const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -t ${duration} -c copy "${outputPath}"`;

      exec(ffmpegCmd, async (err) => {
        if (err || !fs.existsSync(outputPath)) {
          return await sock.sendMessage(m.key.remoteJid, {
            text: decorate('❌ فشل قص الملف، تأكد أن المدة لا تتجاوز مدة المقطع.'),
          }, { quoted: m });
        }

        const result = fs.readFileSync(outputPath);
        const message = type === 'video' ? { video: result } : { audio: result, mimetype: 'audio/mp4' };

        await sock.sendMessage(m.key.remoteJid, message, { quoted: m });

        // حذف الملفات المؤقتة
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: decorate('⚠️ حدث خطأ أثناء المعالجة، حاول مجددًا.'),
      }, { quoted: m });
    }
  }
};