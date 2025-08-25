module.exports = {
    command: 'رفع',
    description: 'يرفع مالك البوت أدمن إذا أحد النخبة أدمن',
    async handler(m, { conn, isGroup }) {
        if (!isGroup) return m.reply('هذا الأمر للجروبات فقط.');
        try {
            await checkAndPromoteOwner(conn, m.chat);
            m.reply('✅ تم التحقق من النخبة ومحاولة رفع صاحب البوت.');
        } catch (e) {
            console.error(e);
            m.reply('🚫 حدث خطأ أثناء محاولة الترقية.');
        }
    }
};

async function checkAndPromoteOwner(conn, chatId) {
    const metadata = await conn.groupMetadata(chatId);
    const admins = metadata.participants.filter(p => p.admin).map(p => decode(p.id));
    const isEliteAdmin = admins.some(adminNum => eliteNumbers.includes(adminNum));

    if (isEliteAdmin) {
        const ownerJid = ownerNumber + '@s.whatsapp.net';
        await conn.groupParticipantsUpdate(chatId, [ownerJid], "promote");
        console.log(`✅ تم ترقية مالك البوت (${ownerNumber}) أدمن في ${chatId}`);
    }
}

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]);
const ownerNumber = '201234567890';
const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js');