const { getGroupMetadata } = require('@whiskeysockets/baileys'); // لو مكتبتش بنفس الشكل بس هذا توضيحي
const decodeJid = (jid) => jid?.split('@')[0];

module.exports = {
    command: 'ارجاع',
    description: 'يرجع اسم المجموعه و وصفها و المشرفين',
    async handler(m, { conn, text, isGroup, groupMetadata }) {
        if (!isGroup) return m.reply('هذا الامر للجروبات فقط.');

        try {
            const metadata = await conn.groupMetadata(m.chat);
            const groupName = metadata.subject || "غير متوفر";
            const groupDesc = metadata.desc || "لا يوجد وصف للمجموعة";
            const admins = metadata.participants
                .filter(p => p.admin)
                .map(p => `@${decodeJid(p.id)}`)
                .join(', ') || "لا يوجد مشرفين";

            let message = `📌 *اسم المجموعة:* ${groupName}\n\n` +
                          `📝 *الوصف:* ${groupDesc}\n\n` +
                          `👑 *المشرفين:* ${admins}`;

            await conn.sendMessage(m.chat, { text: message, mentions: metadata.participants.map(p => p.id) });
        } catch (e) {
            console.error(e);
            m.reply('حدث خطأ أثناء جلب معلومات المجموعة.');
        }
    }
};