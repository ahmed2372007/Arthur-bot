const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'انذار',
    description: 'يعطي إنذار للعضو مع سبب وإذا وصل 3 يتم طرده',
    usage: '.انذار @منشن السبب',
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

            // تحقق إذا كان هناك منشن
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0)
                return await sock.sendMessage(groupJid, { text: '❗ من فضلك منشن العضو الذي تريد إعطاءه إنذار.' }, { quoted: msg });

            const target = mentioned[0];
            const targetLid = decode(target).split('@')[0];

            // التقاط السبب من نص الرسالة
            const fullText = msg.message?.conversation 
                || msg.message?.extendedTextMessage?.text 
                || '';
            const commandText = fullText.trim().split(/\s+/);
            const reason = commandText.slice(2).join(" ") || "بدون سبب 📌";

            // تحميل سجل الإنذارات
            const dataPath = join(process.cwd(), 'warnings.json');
            let warnings = {};
            if (fs.existsSync(dataPath)) {
                warnings = JSON.parse(fs.readFileSync(dataPath));
            }

            // تحديث عدد الإنذارات
            warnings[targetLid] = (warnings[targetLid] || 0) + 1;

            // إرسال رسالة الإنذار
            await sock.sendMessage(groupJid, {
                text: `⚠️ تم إعطائك إنذارًا!\nالسبب: ${reason}\nعدد الإنذارات: ${warnings[targetLid]} / 3`,
                mentions: [target]
            }, { quoted: msg });

            // تحقق من الطرد
            if (warnings[targetLid] >= 3) {
                await sock.sendMessage(groupJid, {
                    text: `🚫 تم طرد @${targetLid} بسبب تجاوز 3 إنذارات.`,
                    mentions: [target]
                });
                await sock.groupParticipantsUpdate(groupJid, [target], 'remove').catch(() => {});
                warnings[targetLid] = 0;
            }

            // حفظ الملف
            fs.writeFileSync(dataPath, JSON.stringify(warnings, null, 2));

        } catch (err) {
            console.error('❌ خطأ في أمر الإنذار:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};