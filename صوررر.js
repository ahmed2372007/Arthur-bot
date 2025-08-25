const axios = require('axios');

module.exports = {
    command:'صور_ج',
    description: 'يجيب صورة القروب أو صورة ملف الشخص',
    usage: '.صوره [منشن أو رد]',
    category: 'utility',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const isGroup = groupJid.endsWith('@g.us');

            if (!isGroup) {
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
            }

            let targetJid = null;

            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant || msg.key.participant;
            } else {
                const groupPicUrl = await sock.profilePictureUrl(groupJid, 'image').catch(() => null);
                if (!groupPicUrl) return await sock.sendMessage(groupJid, { text: '❌ لا يمكن جلب صورة القروب حالياً.' }, { quoted: msg });

                const response = await axios.get(groupPicUrl, { responseType: 'arraybuffer' });
                const groupImageBuffer = Buffer.from(response.data, 'binary');

                return await sock.sendMessage(groupJid, { image: groupImageBuffer, caption: '📸 صورة القروب' }, { quoted: msg });
            }

            // صورة المستخدم
            const userPicUrl = await sock.profilePictureUrl(targetJid, 'image').catch(() => null);
            if (!userPicUrl) return await sock.sendMessage(groupJid, { text: '❌ لا يمكن جلب صورة هذا الشخص.' }, { quoted: msg });

            const userResponse = await axios.get(userPicUrl, { responseType: 'arraybuffer' });
            const userImageBuffer = Buffer.from(userResponse.data, 'binary');

            await sock.sendMessage(groupJid, { image: userImageBuffer, caption: `📸 صورة العضو: ${targetJid.split('@')[0]}` }, { quoted: msg });

        } catch (error) {
            console.error('خطأ في أمر صوره:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ حدث خطأ:\n${error.message}` }, { quoted: msg });
        }
    }
};