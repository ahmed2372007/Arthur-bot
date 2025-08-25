const { isElite } = require('../haykala/elite');

module.exports = {
    command: 'سبام',
    category: 'ادارة',
    description: 'يرسل رسالة مكررة داخل المجموعة بعدد معين (الحد الأقصى 1000)',

    async execute(sock, msg, args = []) {
        const { remoteJid } = msg.key;
        const sender = msg.key.participant || msg.key.remoteJid;

        // ✅ التحقق من صلاحيات النخبة
        if (!(await isElite(sender))) {
            return sock.sendMessage(remoteJid, {
                text: '❌ هذا الأمر مخصص للنخبة فقط.',
            }, { quoted: msg });
        }

        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (!messageText) {
            return sock.sendMessage(remoteJid, {
                text: '⚠️ اكتب الأمر بصيغة:\n.سبام كينج عمك 10',
            }, { quoted: msg });
        }

        // إزالة الأمر وأخذ باقي الكلام
        const input = messageText.replace(/^\.سبام\s*/i, '');
        const parts = input.trim().split(' ');
        const countStr = parts.pop(); // آخر كلمة هي العدد
        const spamText = parts.join(' '); // الباقي هو الرسالة

        const count = parseInt(countStr);
        if (!spamText || isNaN(count) || count < 1 || count > 1000) {
            return sock.sendMessage(remoteJid, {
                text: '❌ تأكد من الصيغة:\n.سبام نص الرسالة 10\n🔺 الحد الأقصى: 1000',
            }, { quoted: msg });
        }

        for (let i = 0; i < count; i++) {
            await sock.sendMessage(remoteJid, { text: spamText });
            await new Promise(res => setTimeout(res, 300)); // تأخير بسيط لتجنب الطرد من واتساب
        }

        return sock.sendMessage(remoteJid, {
            text: `✅ تم إرسال الرسالة "${spamText}" عدد ${count} مرة داخل المجموعة.`,
        }, { quoted: msg });
    }
};