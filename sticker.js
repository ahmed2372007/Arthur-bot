const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { tmpdir } = os;

module.exports = {
  command: 'ملصق',
  description: 'تحويل الصور والفيديوهات إلى ملصقات',
  usage: '.ملصق [بالرد على صورة أو فيديو]',
  category: 'media',

  async execute(sock, m) {
    try {
      const remoteJid = m.key.remoteJid;
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      
      // التحقق من وجود رد على وسائط
      if (!contextInfo || !contextInfo.quotedMessage) {
        return await sock.sendMessage(remoteJid, { 
          text: '⚠️ يرجى الرد على صورة أو فيديو قصير (أقل من 7 ثواني) لتحويله إلى ملصق.' 
        }, { quoted: m });
      }

      const quotedMsg = contextInfo.quotedMessage;
      let mediaType, stream, fileExtension, maxDuration;

      // تحديد نوع الوسائط (صورة أو فيديو)
      if (quotedMsg.imageMessage) {
        mediaType = 'image';
        stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        fileExtension = 'jpg';
        maxDuration = null;
      } else if (quotedMsg.videoMessage) {
        mediaType = 'video';
        const videoMsg = quotedMsg.videoMessage;
        
        // التحقق من مدة الفيديو (تم تخفيضها إلى 7 ثواني)
        if (videoMsg.seconds > 7) {
          return await sock.sendMessage(remoteJid, { 
            text: '⚠️ المدة القصوى المسموح بها هي 7 ثواني. يرجى اختيار فيديو أقصر.' 
          }, { quoted: m });
        }
        
        stream = await downloadContentFromMessage(videoMsg, 'video');
        fileExtension = 'mp4';
        maxDuration = videoMsg.seconds;
      } else {
        return await sock.sendMessage(remoteJid, { 
          text: '⚠️ يرجى الرد على صورة أو فيديو فقط.' 
        }, { quoted: m });
      }

      // تحميل الوسائط
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        return await sock.sendMessage(remoteJid, { 
          text: '⚠️ فشل تحميل الوسائط، يرجى المحاولة مرة أخرى.' 
        }, { quoted: m });
      }

      // إنشاء مسارات مؤقتة
      const tempDir = tmpdir();
      const inputPath = path.join(tempDir, `sticker-input-${Date.now()}.${fileExtension}`);
      const outputPath = path.join(tempDir, `sticker-output-${Date.now()}.webp`);

      fs.writeFileSync(inputPath, buffer);

      // إعداد أوامر FFmpeg مع تحسينات للفيديو
      let ffmpegCommand;
      if (mediaType === 'image') {
        ffmpegCommand = `ffmpeg -i "${inputPath}" -v quiet -y -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -preset default -compression_level 6 -qscale 100 -f webp "${outputPath}"`;
      } else {
        // تحسينات خاصة للفيديو:
        // 1. تقليل معدل الإطارات إلى 12
        // 2. تقليل الجودة إلى 40
        // 3. إزالة الصوت
        ffmpegCommand = `ffmpeg -i "${inputPath}" -v quiet -y -an -r 12 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -loop 0 -preset default -compression_level 6 -qscale 40 -f webp "${outputPath}"`;
      }

      // تنفيذ التحويل
      exec(ffmpegCommand, async (error) => {
        if (error) {
          console.error('FFmpeg error:', error);
          await sock.sendMessage(remoteJid, { 
            text: '❌ فشل في التحويل. تأكد من تثبيت FFmpeg.' 
          }, { quoted: m });
          
          // تنظيف الملفات المؤقتة
          try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          return;
        }

        try {
          const webpBuffer = fs.readFileSync(outputPath);
          
          // التحقق من حجم الملصق
          const maxSize = mediaType === 'image' ? 1 * 1024 * 1024 : 1.5 * 1024 * 1024; // 1.5MB للفيديو
          
          if (webpBuffer.length > maxSize) {
            await sock.sendMessage(remoteJid, { 
              text: '⚠️ حجم الملصق كبير جدًا. جاري تحسين الجودة...' 
            }, { quoted: m });
            
            // تحسين الجودة باستخدام FFmpeg مرة أخرى
            const optimizedPath = path.join(tempDir, `optimized-${Date.now()}.webp`);
            let optimizeCommand = `ffmpeg -i "${outputPath}" -qscale ${mediaType === 'image' ? 90 : 30} "${optimizedPath}"`;
            
            exec(optimizeCommand, async (optimizeError) => {
              if (!optimizeError) {
                const optimizedBuffer = fs.readFileSync(optimizedPath);
                await sock.sendMessage(remoteJid, { sticker: optimizedBuffer }, { quoted: m });
                
                // تنظيف الملف المحسن بعد الإرسال
                try { fs.unlinkSync(optimizedPath); } catch (e) {}
              } else {
                // إذا فشل التحسين، نرسل النسخة الأصلية
                await sock.sendMessage(remoteJid, { sticker: webpBuffer }, { quoted: m });
              }
            });
          } else {
            await sock.sendMessage(remoteJid, { sticker: webpBuffer }, { quoted: m });
          }
        } catch (sendError) {
          console.error('Send error:', sendError);
          
          // محاولة إرسال كملف بدلاً من ملصق إذا فشل الإرسال
          try {
            await sock.sendMessage(remoteJid, { 
              document: fs.readFileSync(outputPath),
              mimetype: 'image/webp',
              fileName: 'ملصق.webp'
            }, { quoted: m });
          } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            await sock.sendMessage(remoteJid, { 
              text: '❌ فشل في إرسال الملصق. ' + (fallbackError.message || fallbackError.toString())
            }, { quoted: m });
          }
        }

        // تنظيف الملفات المؤقتة
        try {
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });

    } catch (error) {
      console.error('Sticker command error:', error);
      await sock.sendMessage(m.key.remoteJid, { 
        text: '❌ حدث خطأ غير متوقع: ' + (error.message || error.toString())
      }, { quoted: m });
    }
  }
};