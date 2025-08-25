const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'نزلهم',
    description: 'ينزل كل المشرفين في المجموعة ما عدا الشخص الذي كتب الأمر.',
    usage: '.نزلهم',
    category: 'إدارة',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const senderJid = decode(msg.key.participant || groupJid);

            if (!groupJid.endsWith('@g.us')) return;

            const groupMetadata = await sock.groupMetadata(groupJid);
            const admins = groupMetadata.participants.filter(
                m => m.admin === 'admin' || m.admin === 'superadmin'
            );

            if (admins.length === 0) {
                return await sock.sendMessage(groupJid, {
                    text: '❗ لا يوجد مشرفون في هذه المجموعة.',
                }, { quoted: msg });
            }

            const demoteList = admins
                .map(a => a.id)
                .filter(id => id !== senderJid); // استثني من أعطى الأمر فقط

            if (demoteList.length === 0) {
                return await sock.sendMessage(groupJid, {
                    text: '🚫 لا يوجد مشرفون يمكن إزالة إشرافهم غيرك.',
                }, { quoted: msg });
            }

            await sock.groupParticipantsUpdate(groupJid, demoteList, 'demote');

            await sock.sendMessage(groupJid, {
                text: '✅ تم إزالة الإشراف عن كل المشرفين ما عداك.',
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ في أمر نزلهم:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '⚠️ حدث خطأ أثناء تنفيذ العملية.',
            }, { quoted: msg });
        }
    }
};
console.log("✅ إضافة أرقام النخبة:");
[
  '201065826587',
  '201011216953', 
].forEach(num => {
  console.log(`➕ ${num}`);
  addEliteNumber(num);
});