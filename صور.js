const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'صور',
    description: 'يرسل صورة أنمي عشوائية من موقع مفتوح المصدر (محليًا)',
    usage: 'صور [اسم الشخصية]',
    category: 'fun',

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const query = args.join(' ').toLowerCase().trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '❌ اكتب اسم الشخصية بعد الأمر، مثال: صور غوكو'
            }, { quoted: msg });
        }

        const supported = {
            'غوكو': 'goku',
            'غوجو': 'gojo',
            'نيزوكو': 'nezuko',
            'ليفاي': 'levi',
            'ناروتو': 'naruto',
            'ميكاسا': 'mikasa',
            'ريمن': 'rem',
            'زورو': 'zoro',
            'لوفي': 'luffy',
            'ايتاشي': 'itachi'
        };

        const charKey = supported[query];

        if (!charKey) {
            return await sock.sendMessage(chatId, {
                text: '❌ هذه الشخصية غير مدعومة حاليًا.\nجرب: غوكو - غوجو - نيزوكو - ليفاي ...'
            }, { quoted: msg });
        }

        try {
            const response = await axios.get(`https://nekos.best/api/v2/${charKey}`);
            const imageUrl = response.data.results[0].url;

            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imgRes.data, 'binary');

            await sock.sendMessage(chatId, {
                image: buffer,
                caption: `📸 صورة عشوائية لـ ${query}`
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ أثناء جلب أو إرسال الصورة:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ حدث خطأ أثناء جلب الصورة. قد تكون مشكلة في الاتصال.'
            }, { quoted: msg });
        }
    }
};