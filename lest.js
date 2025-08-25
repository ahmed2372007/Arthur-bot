const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'قائمة',
    description: 'يعرض ترتيب الأعضاء اللي عندهم إنذارات مع المتبقي أو الطرد السابق',
    usage: '.قائمة',
    category: 'zarf',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;

            if (!groupJid.endsWith('@g.us')) {
                return await sock.sendMessage(groupJid, {
                    text: '❗ هذا الأمر يعمل فقط داخل المجموعات.'
                }, { quoted: msg });
            }

            const dataPath = join(process.cwd(), 'warnings.json');
            if (!fs.existsSync(dataPath)) {
                return await sock.sendMessage(groupJid, {
                    text: '🚫 لا يوجد أي إنذارات مسجلة.'
                }, { quoted: msg });
            }

            const warnings = JSON.parse(fs.readFileSync(dataPath));
            const groupMetadata = await sock.groupMetadata(groupJid);

            const memberWarns = groupMetadata.participants.map(p => {
                const lid = decode(p.id).split('@')[0];
                return {
                    id: p.id,
                    lid,
                    warns: warnings[lid] ?? 0,
                    hadRecord: lid in warnings
                };
            }).filter(u => u.warns > 0 || u.hadRecord);

            if (memberWarns.length === 0) {
                return await sock.sendMessage(groupJid, {
                    text: '✅ لا يوجد أي عضو عنده إنذارات.'
                }, { quoted: msg });
            }

            // ترتيب بحيث اللي عنده إنذارات أعلى يظهر أول
            memberWarns.sort((a, b) => b.warns - a.warns);

            let topList = '📜 قائمة الإنذارات:\n\n';
            for (const user of memberWarns) {
                if (user.warns > 0) {
                    const remaining = 3 - user.warns;
                    topList += `- @${user.lid} : ${user.warns} / 3 (باقي له ${remaining})\n`;
                } else {
                    topList += `- @${user.lid} : 🚫 تم الطرد سابقًا (صفر إنذارات حاليًا)\n`;
                }
            }

            await sock.sendMessage(groupJid, {
                text: topList,
                mentions: memberWarns.map(u => u.id)
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في أمر القائمة:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};