const axios = require('axios');

async function translateToArabic(text) {
    try {
        const res = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: 'en',
                tl: 'ar',
                dt: 't',
                q: text
            }
        });

        const translated = res.data[0].map(part => part[0]).join('');
        return translated;
    } catch (e) {
        console.error('فشل الترجمة:', e.message);
        return text; // في حال فشل الترجمة نرجع النص الأصلي
    }
}

module.exports = {
    command: 'انمي',
    description: 'يعرض معلومات أنمي باللغة العربية.',
    usage: '.انمي [اسم الأنمي]',
    
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
        const args = body.trim().split(/\s+/).slice(1);
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(groupJid, {
                text: '❗ الرجاء كتابة اسم الأنمي. مثال:\n.انمي Naruto'
            }, { quoted: msg });
        }

        try {
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
            const data = res.data.data;

            if (!data || data.length === 0) {
                return await sock.sendMessage(groupJid, {
                    text: `❌ لم يتم العثور على نتائج للأنمي "${query}".`
                }, { quoted: msg });
            }

            const anime = data[0];
            const translatedSynopsis = await translateToArabic(anime.synopsis || 'لا يوجد وصف متاح');

            const info = `📺 *الاسم:* ${anime.title}\n` +
                         `📝 *الوصف:* ${translatedSynopsis}\n` +
                         `📅 *تاريخ العرض:* ${anime.aired.string || 'غير معروف'}\n` +
                         `🎭 *النوع:* ${anime.type || 'غير معروف'}\n` +
                         `🎯 *التصنيف:* ${anime.rating || 'غير مصنف'}\n` +
                         `🔗 *الرابط:* ${anime.url}`;

            await sock.sendMessage(groupJid, {
                image: { url: anime.images.jpg.image_url },
                caption: info
            }, { quoted: msg });

        } catch (error) {
            console.error('خطأ أثناء جلب الأنمي:', error.message);
            await sock.sendMessage(groupJid, {
                text: `❌ حدث خطأ أثناء جلب بيانات الأنمي:\n${error.message}`
            }, { quoted: msg });
        }
    }
};