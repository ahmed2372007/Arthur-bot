const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { default: axiosDefault } = require('axios');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

module.exports = {
  command: ['ملصقق'],
  description: 'البحث عن صور من Pinterest وتحويلها إلى ملصقات تلقائيًا.',
  usage: 'صور <كلمة البحث> [عدد الصور]',
  category: 'tools',

  async execute(sock, msg, args = []) {
    const fullText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';

    const inputText = fullText
      .replace(/^([،.\/!#])?صور\s*/i, '')
      .trim();

    if (!inputText) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ اكتب شيء أبحث عنه بعد كلمة "صور"',
      }, { quoted: msg });
    }

    let numberOfImages = 15; // افتراضي
    let searchQuery = inputText;

    const parts = inputText.split(' ');
    const lastPart = parts[parts.length - 1];
    if (!isNaN(lastPart)) {
      numberOfImages = Math.min(parseInt(lastPart), 15); // الحد الأقصى 10 ملصقات
      parts.pop();
      searchQuery = parts.join(' ').trim();
    }

    if (!searchQuery) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ يرجى كتابة كلمة البحث بعد الأمر.',
      }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      text: `🔍 جاري البحث عن: *${searchQuery}* ...`,
    }, { quoted: msg });

    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}+site:pinterest.com`;

    try {
      const { data } = await axios.get(searchUrl);
      const $ = cheerio.load(data);
      const imageUrls = [];

      $('a.iusc').each((i, el) => {
        const m = $(el).attr('m');
        try {
          const json = JSON.parse(m);
          if (json.murl) imageUrls.push(json.murl);
        } catch {}
      });

      if (imageUrls.length === 0) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لم يتم العثور على نتائج.',
        }, { quoted: msg });
      }

      const imagesToSend = imageUrls.slice(0, numberOfImages);
      let sentCount = 0;

      for (const [index, imgUrl] of imagesToSend.entries()) {
        try {
          const inputPath = path.join(__dirname, `temp-${Date.now()}-${index}.jpg`);
          const outputPath = path.join(__dirname, `temp-${Date.now()}-${index}.webp`);

          const response = await axiosDefault({
            url: imgUrl,
            method: 'GET',
            responseType: 'stream'
          });

          await streamPipeline(response.data, fs.createWriteStream(inputPath));

          await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -preset default -quality 100 -compression_level 6 -qscale 50 ${outputPath}`, async (error) => {
              if (error) {
                console.error(`FFmpeg Error (صورة ${index + 1}):`, error);
                reject();
              } else {
                try {
                  const webpBuffer = fs.readFileSync(outputPath);
                  await sock.sendMessage(msg.key.remoteJid, {
                    sticker: webpBuffer
                  }, { quoted: msg });

                  sentCount++;
                } catch (sendError) {
                  console.error('Send error:', sendError);
                } finally {
                  fs.unlinkSync(inputPath);
                  fs.unlinkSync(outputPath);
                  resolve();
                }
              }
            });
          });
        } catch (err) {
          console.error(`❌ خطأ في صورة ${index + 1}:`, err);
        }
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: `✅ تم إرسال ${sentCount} ملصق${sentCount === 1 ? '' : 'ات'} من نتائج *${searchQuery}*!`,
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ أثناء البحث:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء المعالجة.',
      }, { quoted: msg });
    }
  }
};