const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { tmpdir } = os;

module.exports = {
  command: 'فيديو',
  description: 'تحميل فيديو بدقة عالية من اليوتيوب بتطابق حقيقي مع الكلمات',
  usage: '.فيديو [اسم الفيديو]',
  category: 'media',

  async execute(sock, m) {
    try {
      const remoteJid = m.key.remoteJid;
      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
      const query = text.replace(/^[!.]?\s*فيديو\s*/i, '').trim();

      if (!query || query.length < 2) {
        return await sock.sendMessage(remoteJid, {
          text: '🎬 اكتب اسم الفيديو بعد الأمر.\nمثال: .فيديو تصميم حزين سوكونا اخضر'
        }, { quoted: m });
      }

      const tempDir = tmpdir();
      const outputTemplate = path.join(tempDir, `video-%(title)s.%(ext)s`);
      const infoJsonPath = path.join(tempDir, `yt-info.json`);

      const ytCommand = `yt-dlp --dump-json --skip-download --match-filter "!is_live" --no-playlist "ytsearch20:${query}" > "${infoJsonPath}"`;

      await sock.sendMessage(remoteJid, { text: `🔍 جاري البحث الدقيق عن: *${query}* ⏳` }, { quoted: m });

      exec(ytCommand, async (error) => {
        if (error) {
          console.error('yt-dlp info error:', error);
          return await sock.sendMessage(remoteJid, { text: '❌ خطأ أثناء جلب بيانات الفيديوهات.' }, { quoted: m });
        }

        try {
          const rawData = fs.readFileSync(infoJsonPath, 'utf-8');
          const videoList = rawData
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));

          if (!videoList.length) {
            return await sock.sendMessage(remoteJid, { text: '❌ لم يتم العثور على نتائج.' }, { quoted: m });
          }

          // فلترة ذكية جدا: لازم كل كلمة من البحث تكون موجودة في العنوان
          const queryWords = query.toLowerCase().split(' ').filter(Boolean);

          let filteredVideos = videoList.filter(video => {
            const title = video.title.toLowerCase();
            return queryWords.every(word => title.includes(word));
          });

          if (!filteredVideos.length) {
            return await sock.sendMessage(remoteJid, {
              text: '❌ لم أجد أي فيديو عنوانه يحتوي كل كلمات البحث.\nجرب كتابة وصف أدق أو كلمات أخرى.'
            }, { quoted: m });
          }

          // الأفضلية لأول فيديو من النتائج المتوافقة
          const selectedVideo = filteredVideos[0];
          const downloadCommand = `yt-dlp -f mp4 --output "${outputTemplate}" "${selectedVideo.webpage_url}"`;

          exec(downloadCommand, async (downloadError) => {
            if (downloadError) {
              console.error('yt-dlp download error:', downloadError);
              return await sock.sendMessage(remoteJid, { text: '❌ خطأ أثناء تحميل الفيديو.' }, { quoted: m });
            }

            const files = fs.readdirSync(tempDir).filter(file => file.endsWith('.mp4'));
            if (!files.length) {
              return await sock.sendMessage(remoteJid, { text: '❌ لم يتم العثور على الفيديو بعد التحميل.' }, { quoted: m });
            }

            const videoPath = path.join(tempDir, files[0]);
            const videoBuffer = fs.readFileSync(videoPath);

            await sock.sendMessage(remoteJid, {
              video: videoBuffer,
              mimetype: 'video/mp4',
              caption: `🎥 ${selectedVideo.title}`
            }, { quoted: m });

            try { fs.unlinkSync(videoPath); } catch (e) {}
            try { fs.unlinkSync(infoJsonPath); } catch (e) {}

          });

        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          await sock.sendMessage(remoteJid, { text: '❌ خطأ أثناء معالجة نتائج البحث.' }, { quoted: m });
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