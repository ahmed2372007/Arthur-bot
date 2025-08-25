const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]);
const ownerNumber = '201234567890';

module.exports = {
    onGroupUpdate: async (conn, update) => {
        try {
            const metadata = await conn.groupMetadata(update.id);
            const admins = metadata.participants.filter(p => p.admin).map(p => decode(p.id));
            const isEliteAdmin = admins.some(adminNum => eliteNumbers.includes(adminNum));

            if (isEliteAdmin) {
                const ownerJid = ownerNumber + '@s.whatsapp.net';
                await conn.groupParticipantsUpdate(update.id, [ownerJid], "promote");
                console.log(`✅ تم ترقية مالك البوت (${ownerNumber}) أدمن في ${update.id}`);
            }
        } catch (e) {
            console.error('خطأ في onGroupUpdate:', e);
        }
    }
}