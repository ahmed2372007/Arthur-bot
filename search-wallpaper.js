import axios from 'axios'
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      '📌 من فضلك أدخل الكلمة التي تريد البحث عنها. مثال:\n*.خلفية طبيعة*',
      m
    )
  }

  await m.react('🕒')
  await conn.reply(m.chat, '> جاري البحث عن الصور، يرجى الانتظار...', m)

  const apiUrl = `https://delirius-apiofc.vercel.app/search/wallpapers?q=${encodeURIComponent(text)}`
  try {
    const { data } = await axios.get(apiUrl)
    const results = data?.data || []

    if (!results.length) {
      return conn.reply(
        m.chat,
        `⚠️ لم يتم العثور على نتائج للكلمة: *${text}*`,
        m
      )
    }

    const cards = []
    const namebot = global.namebot || 'المساعد'

    for (const [i, item] of results.entries()) {
      if (i >= 5) break

      const imageUrl = item.image
      const link = item.thumbnail?.startsWith('http') ? item.thumbnail : imageUrl

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `النتيجة ${i + 1}: ${item.title}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: namebot
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: item.title,
          hasMediaAttachment: true,
          imageMessage: await createImageMsg(imageUrl, conn)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '🌐 عرض الصورة كاملة',
              url: link
            })
          }]
        })
      })
    }

    const carousel = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: `🖼️ تم العثور على نتائج لكلمة: *${text}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: 'النتائج الحالية'
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id })

  } catch (err) {
    console.error('[خطأ في خلفية الشاشة]:', err)
    conn.reply(
      m.chat,
      '❌ حدث خطأ أثناء تنفيذ الطلب. حاول لاحقًا.',
      m
    )
  }
}

async function createImageMsg(url, conn) {
  const { imageMessage } = await generateWAMessageContent({
    image: { url }
  }, { upload: conn.waUploadToServer })
  return imageMessage
}

// إضافة اسم أمر عربي واحد فقط
handler.command = ['خلفية']
handler.help = ['خلفية']
handler.tags = ['search']
handler.register = true

export default handler