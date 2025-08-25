import axios from 'axios'

const { proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice } = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.reply(message.chat, '[❗️] *فين النص اللي هتبحث عنو ف تيكتوك ي حوب 🧞*', message)

    // ⌛ التفاعل الأول

    await message.react("⌛")

    await conn.reply(message.chat, '> ⏳ جاري البحث عن الفيديوهات...', message)

    async function createVideoMessage(url) {

        const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer })

        return videoMessage

    }

    function shuffleArray(array) {

        for (let i = array.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [array[i], array[j]] = [array[j], array[i]]

        }

    }

    try {

        let results = []

        let { data: response } = await axios.get('https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=' + encodeURIComponent(text))

        let searchResults = response.data

        shuffleArray(searchResults)

        let selectedResults = searchResults.splice(0, 6)

        for (let result of selectedResults) {

            results.push({

                body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),

                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: '📥 TikTok Downloader' }),

                header: proto.Message.InteractiveMessage.Header.fromObject({

                    title: '' + result.title,

                    hasMediaAttachment: true,

                    videoMessage: await createVideoMessage(result.nowm)

                }),

                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })

            })

        }

        const responseMessage = generateWAMessageFromContent(message.chat, {

            viewOnceMessage: {

                message: {

                    messageContextInfo: {

                        deviceListMetadata: {},

                        deviceListMetadataVersion: 2

                    },

                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({

                        body: proto.Message.InteractiveMessage.Body.create({ text: '[❗️] نتائج البحث عن : ' + text }),

                        footer: proto.Message.InteractiveMessage.Footer.create({ text: '🔎 `بحــث تيكــتوك ...`' }),

                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),

                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: results })

                    })

                }

            }

        }, { quoted: message })

        // ✅ التفاعل بعد الإرسال

        await message.react("✅")

        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id })

    } catch (error) {

        await message.react("❌")

        await conn.reply(message.chat, `❌ حدث خطأ أثناء البحث:\n${error}`, message)

    }

}

handler.help = ['tiktoksearch <txt>']

handler.tags = ['buscador']

handler.command = ['تيكتوك', 'tts', 'توكك']

export default handler