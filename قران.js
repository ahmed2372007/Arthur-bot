const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const lastIndexFile = './temp/last_quran.json';

const recitations = [
  'https://vt.tiktok.com/ZSBk9Xdg7/',
  'https://vt.tiktok.com/ZSBk9VUMD/',
  'https://vt.tiktok.com/ZSBk94pXW/',
  'https://vt.tiktok.com/ZSBk9V3KA/',
  'https://vt.tiktok.com/ZSBk9PwQs/',
  'https://vt.tiktok.com/ZSBkxbc5D/',
  'https://vt.tiktok.com/ZSBkxuKDh/',
  'https://vt.tiktok.com/ZSBkxSDyg/',
  'https://vt.tiktok.com/ZSBkxAwaq/',
  'https://vt.tiktok.com/ZSBkxAEvD/',
  'https://vt.tiktok.com/ZSBkxCB4G/',
  'https://vt.tiktok.com/ZSBkxCvFC/',
  'https://vt.tiktok.com/ZSBkxw53m/'
];

module.exports = {
  command: 'قرآن',
  description: '🔊 تلاوة منظمة بصوت الشيخ محمد اللحيدان من TikTok',
  usage: '.قرآن أو .قرآن [رقم التلاوة]',

  async execute(sock, msg, args = []) {
    try {
      const chatId = msg.key.remoteJid;
      let selectedIndex;

      // ✅ لو المستخدم كتب رقم معين
      if (args.length > 0 && !isNaN(args[0])) {
        const num = parseInt(args[0]);
        if (num < 1 || num > recitations.length) {
          return await sock.sendMessage(chatId, {
            text: `❌ الرقم غير صالح.\n🔢 *عدد التلاوات المتاحة:* ${recitations.length}`,
          }, { quoted: msg });
        }
        selectedIndex = num - 1;
      } else {
        // ✅ لو المستخدم ما كتبش رقم → نستخدم نظام الدور
        let lastIndex = 0;
        if (fs.existsSync(lastIndexFile)) {
          const fileData = fs.readFileSync(lastIndexFile, 'utf8');
          lastIndex = JSON.parse(fileData).last || 0;
        }
        selectedIndex = (lastIndex + 1) % recitations.length;
        fs.writeFileSync(lastIndexFile, JSON.stringify({ last: selectedIndex }));
      }

      const selectedUrl = recitations[selectedIndex];
      const timestamp = Date.now();
      const outputPath = `./temp/quran-${timestamp}.mp3`;

      // 🕌 رسالة مزخرفة قبل التحميل
      await sock.sendMessage(chatId, {
        text: `╭───❖───✦───❖───╮\n🕋 *في رحابِ القرآنِ... سكينةٌ لا تنتهي*\n📖 *In the presence of the Qur'an... everlasting peace.*\n╰───❖───✦───❖───╯\n\n📥 *تحميل التلاوة رقم:* ${selectedIndex + 1} من ${recitations.length}`,
      }, { quoted: msg });

      // 🎧 externalAdReply احترافي
      await sock.sendMessage(chatId, {
        text: '',
        contextInfo: {
          externalAdReply: {
            title: `🎧 تلاوة قرآنية`,
            body: `📥 رقم ${selectedIndex + 1} بصوت الشيخ محمد اللحيدان`,
            thumbnail: fs.existsSync('./media/quran.jpg') ? fs.readFileSync('./media/quran.jpg') : null,
            mediaType: 2,
            sourceUrl: selectedUrl
          }
        }
      }, { quoted: msg });

      // ⬇️ تحميل التلاوة
      exec(`yt-dlp -x --audio-format mp3 -o "${outputPath}" "${selectedUrl}"`, async (error) => {
        if (error || !fs.existsSync(outputPath)) {
          console.error('[ERROR] تحميل التلاوة:', error?.message);
          return await sock.sendMessage(chatId, {
            text: `❌ لم نتمكن من تحميل التلاوة.\n🔁 حاول مرة أخرى.`,
          }, { quoted: msg });
        }

        try {
          await sock.sendMessage(chatId, {
            audio: { url: outputPath },
            mimetype: 'audio/mpeg'
          }, { quoted: msg });
        } catch (sendErr) {
          console.error('[ERROR] إرسال التلاوة:', sendErr);
        } finally {
          fs.unlink(outputPath, () => {});
        }
      });

    } catch (err) {
      console.error('❌ خطأ في أمر القرآن:', err);
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n\`\`\`${err.message || err.toString()}\`\`\``
      }, { quoted: msg });
    }
  }
};