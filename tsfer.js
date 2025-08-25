const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'تصفير',
    description: 'يصفّر إنذارات عضو محدد',
    usage: '.تصفير @منشن',
    category: 'zarf',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            if (!groupJid.endsWith('@g.us'))
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];
            if (!eliteNumbers.includes(senderLid))
                return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0)
                return await sock.sendMessage(groupJid, { text: '❗ من فضلك منشن العضو الذي تريد تصفير إنذاراته.' }, { quoted: msg });

            const target = mentioned[0];
            const targetLid = decode(target).split('@')[0];

            // تحميل ملف الإنذارات
            const dataPath = join(process.cwd(), 'warnings.json');
            let warnings = {};
            if (fs.existsSync(dataPath)) {
                warnings = JSON.parse(fs.readFileSync(dataPath));
            }

            warnings[targetLid] = 0; // تصفير
            fs.writeFileSync(dataPath, JSON.stringify(warnings, null, 2));

            await sock.sendMessage(groupJid, {
                text: `✅ تم تصفير إنذارات @${targetLid}.`,
                mentions: [target]
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في أمر التصفير:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};