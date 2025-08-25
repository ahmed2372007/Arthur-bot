import axios from 'axios'
import fs from 'fs'
import path from 'path'

// إعداد مجلد مؤقت للملفات
process.env.TMPDIR = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(process.env.TMPDIR)) {
  fs.mkdirSync(process.env.TMPDIR, { recursive: true })
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `💜 مثال على الاستخدام: ${usedPrefix + command} Mini Dog`, m);
    }

    m.react('🕒');
    let old = new Date();
    let res = await ttks(text);
    let videos = res.data;

    if (!videos.length) {
      return conn.reply(m.chat, "❌ لم يتم العثور على فيديوهات.", m);
    }

    let cap = `🎵 *فيديوهات من تيك توك*\n\n`
            + `🎬 *العنوان:* ${videos[0].title}\n`
            + `🔍 *بحثك:* ${text}`;

    let medias = videos.map((video, index) => ({
      type: "video",
      data: { url: video.no_wm },
      caption: index === 0
        ? cap
        : `🎬 *العنوان:* ${video.title}\n⏱️ *المدة:* ${((new Date() - old) * 1)} ms`
    }));

    await conn.sendSylphy(m.chat, medias, { quoted: m });
    m.react('✅');
  } catch (e) {
    return conn.reply(m.chat, `⚠️ حدث خطأ أثناء جلب الفيديوهات:\n\n${e}`, m);
  }
};

handler.command = ["تيك"]; // ← أضفنا أمر عربي
handler.help = ["تيك"];
handler.tags = ["search"];
export default handler;

// دالة البحث
async function ttks(query) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      },
      data: {
        keywords: query,
        count: 20,
        cursor: 0,
        HD: 1
      }
    });

    const videos = response.data.data.videos;
    if (videos.length === 0) throw new Error("❌ لم يتم العثور على نتائج للبحث.");

    const shuffled = videos.sort(() => 0.5 - Math.random()).slice(0, 5);
    return {
      status: true,
      creator: "Made with Ado",
      data: shuffled.map(video => ({
        title: video.title,
        no_wm: video.play,
        watermark: video.wmplay,
        music: video.music
      }))
    };
  } catch (error) {
    throw error;
  }
}