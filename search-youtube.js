import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: `📌 يجب كتابة شيء للبحث في YouTube.\n\n> مثال:\n${usedPrefix + command} lofi anime`,
    ...global.rcanal
  }, { quoted: m })

  await m.react('🔍')

  const botJid = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = path.join('./JadiBots', botJid, 'config.json')
  let nombreBot = global.namebot || '❀ Mai-Bot ❀'
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.log('❌ خطأ أثناء قراءة إعدادات البوت الفرعي:', err)
    }
  }

  const imgPath = './storage/img/ytsearch.jpg'

  try {
    const results = await yts(text)
    const videos = results.videos.slice(0, 5)

    if (!videos.length) {
      await conn.sendMessage(m.chat, {
        text: `❌ لم يتم العثور على نتائج لكلمة: *${text}*.\n> حاول استخدام كلمات مختلفة.`,
        ...global.rcanal
      }, { quoted: m })
      await m.react('❌')
      return
    }

    let caption = `📥 *نتائج البحث عن:* *${text}*\n\n`

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      caption += `*${i + 1}.* 🎬 *${video.title}*\n\n`
      caption += `📝 الوصف: *${video.description?.slice(0, 100) || 'لا يوجد وصف'}*\n`
      caption += `👤 القناة: *${video.author.name}*\n`
      caption += `⏱️ المدة: *${video.timestamp}*\n`
      caption += `📅 منذ: *${video.ago}*\n`
      caption += `🔗 الرابط: ${video.url}\n\n`
    }

    caption += `╰─「 ${nombreBot} 」`

    const messagePayload = /^https?:\/\//.test(imgPath)
      ? { image: { url: imgPath } }
      : { image: fs.readFileSync(imgPath) }

    await conn.sendMessage(m.chat, {
      ...messagePayload,
      caption: caption.trim(),
      mentions: conn.parseMention(caption),
      ...global.rcanal
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `⚠️ حدث خطأ أثناء البحث، حاول لاحقًا.`,
      ...global.rcanal
    }, { quoted: m })
    await m.react('💥')
  }
}

handler.tags = ['search']
handler.help = ['يوت']
handler.command = ['يوت'] // ← تم إضافة أمر عربي واحد فقط
handler.register = true

export default handler