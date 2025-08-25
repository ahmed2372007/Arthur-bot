const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['بطاقة'],
    description: 'يعرض بطاقة أنمي مميزة تحتوي على قدرة وسلاح ونوع خاص بك',
    usage: '.بطاقة',
    category: 'أنمي',
    async execute(sock, msg, args) {
        const jid = msg.key.participant || msg.key.remoteJid;
        const name = msg.pushName || 'مقاتل مجهول';

        // قاعدة بيانات عشوائية للبطاقات
        const abilities = ['تحكم في الوقت', 'قوة خارقة', 'نسخ القدرات', 'لهب أسود', 'عين الشيطان', 'سيطرة على الجاذبية'];
        const weapons = ['سيف الظلال', 'قوس النور', 'رمح التنين', 'كتاب الأرواح', 'درع الفوضى', 'سلسلة الطاقة'];
        const types = ['ساحر', 'مقاتل', 'نينجا', 'صياد', 'مستدعي', 'مخترق'];

        // اختيار عشوائي
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const ability = rand(abilities);
        const weapon = rand(weapons);
        const type = rand(types);

        const card = `
╭━━〔 🎴 بطاقة أنمي 〕━━⬣
│👤 الاسم: *${name}*
│🧬 النوع: *${type}*
│💥 القدرة: *${ability}*
│🗡️ السلاح: *${weapon}*
│📛 الرتبة: *A+*
╰━━〔 𝑲𝑰𝑵𝑮 𝑺𝑶𝑳𝑶 〕━━⬣
        `.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: card }, { quoted: msg });
    }
};