const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'فتح',
    description: 'فتح المجموعة إذا كانت مقفلة للمشرفين فقط',
    usage: '.فتح',
    category: 'zarf',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!groupJid.endsWith('@g.us'))
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

            if (!eliteNumbers.includes(senderLid))
                return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

            const groupMetadata = await sock.groupMetadata(groupJid);
            
            // التحقق من إعدادات المجموعة الحالية
            if (!groupMetadata.announce && !groupMetadata.restrict) {
                return await sock.sendMessage(groupJid, { text: '✅ المجموعة مفتوحة بالفعل للجميع.' }, { quoted: msg });
            }

            // تحديث إعدادات المجموعة
            await sock.groupSettingUpdate(groupJid, 'not_announcement'); // فتح إرسال الرسائل للجميع
            await sock.groupSettingUpdate(groupJid, 'not_restrict'); // فتح التعديل للجميع
            
            // إرسال رد بالنجاح
            await sock.sendMessage(groupJid, { 
                text: '✅ تم فتح المجموعة بنجاح:\n- يمكن للجميع إرسال الرسائل\n- يمكن للجميع تعديل إعدادات المجموعة'
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ في أمر فتح:', error);
            let errorMessage = '❌ فشل في فتح المجموعة!';
            
            if (error.message.includes('not an admin')) {
                errorMessage = '❗ البوت ليس مشرفاً في هذه المجموعة';
            } else if (error.message.includes('404')) {
                errorMessage = '❗ المجموعة غير موجودة أو البوت لم يعد عضوًا';
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `${errorMessage}\n\n${error.message || error.toString()}`
            }, { quoted: msg });
        }
    }
};