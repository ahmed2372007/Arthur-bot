const axios = require('axios');

const apiKey = 'AIzaSyCUQ-woLVTBN1KCKRHs9iA9vBlktkgZdNU';
const cx = 'd0a5c62f495f04461';

module.exports = {
  command: 'صورة',
  description: 'جلب صور من Google مع إمكانية تحديد العدد والموقع (Pinterest، DeviantArt...)',
  usage: '.صورة [الموقع] [العدد] [الاسم] أو .صورة [العدد] [الاسم]',
  category: 'media',

  async execute(sock, m) {
    const remoteJid = m.key.remoteJid;
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

    const args = text.trim().split(/\s+/).slice(1); // إزالة "صورة"
    let count = 5;
    let site = '';
    let queryTerms = [];

    // تحليل المدخلات
    for (let arg of args) {
      if (!isNaN(arg)) {
        count = Math.max(1, Math.min(parseInt(arg), 10)); // بين 1 و 10
      } else if (/^(pinterest|deviantart|tumblr)$/i.test(arg)) {
        site = `site:${arg.toLowerCase()}.com`;
      } else {
        queryTerms.push(arg);
      }
    }

    const rawQuery = queryTerms.join(' ');
    if (!rawQuery || rawQuery.length < 2) {
      return await sock.sendMessage(remoteJid, {
        text: '🖼️ من فضلك اكتب اسم الصورة بعد الأمر.\nمثال: `.صورة pinterest 6 sukuna`'
      }, { quoted: m });
    }

    const query = `${rawQuery} ${site} anime wallpaper HD -shirt -fanart -drawing`;

    await sock.sendMessage(remoteJid, {
      text: `🔍 جاري البحث عن *${count}* صور لـ: *${rawQuery}*${site ? ` (من ${site})` : ''}`
    }, { quoted: m });

    try {
      const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: cx,
          q: query,
          searchType: 'image',
          num: Math.min(count, 10),
          safe: 'active',
          imgSize: 'large'
        }
      });

      const items = res.data.items;

      if (!items || items.length === 0) {
        return await sock.sendMessage(remoteJid, {
          text: '❌ لم أجد أي صور مناسبة.'
        }, { quoted: m });
      }

      let sentCount = 0;
      const usedLinks = new Set();

      for (let item of items) {
        if (sentCount >= count) break;
        if (usedLinks.has(item.link)) continue;
        usedLinks.add(item.link);

        try {
          const imgRes = await axios.get(item.link, { responseType: 'arraybuffer' });
          const imgBuffer = Buffer.from(imgRes.data);

          await sock.sendMessage(remoteJid, {
            image: imgBuffer,
            caption: `🖼️ صورة ${++sentCount} لـ: *${rawQuery}*`
          }, { quoted: m });

        } catch (err) {
          console.warn(`⚠️ فشل تحميل الصورة: ${item.link}`);
        }
      }

      if (sentCount === 0) {
        await sock.sendMessage(remoteJid, {
          text: '❌ لم أتمكن من تحميل أي صورة صالحة.'
        }, { quoted: m });
      }

    } catch (error) {
      console.error('❌ خطأ في Google API:', error.response?.data || error.message);
      await sock.sendMessage(remoteJid, {
        text: '❌ حصل خطأ أثناء تحميل الصور.'
      }, { quoted: m });
    }
  }
};