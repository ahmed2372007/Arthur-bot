const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

module.exports = {
  command: 'صوره',
  description: 'تغيير صورة الجروب، متاح فقط للنخبة.',
  usage: '.صوره (أرسل صورة أو رد على صورة)',
  category: 'admin',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const senderId = msg.key.participant || msg.key.remoteJid;

      // ✅ تحقق من النخبة
      const senderLid = senderId.split('@')[0];
      if (!isElite(senderLid)) {
        return sock.sendMessage(chatId, {
          text: '❌ هذا الأمر متاح فقط لأعضاء النخبة!'
        }, { quoted: msg });
      }

      // ✅ استخراج الصورة من الرسالة أو الرد
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;

      if (!imageMessage) {
        return sock.sendMessage(chatId, {
          text: '❌ يرجى إرسال صورة أو الرد على صورة لتغيير صورة المجموعة.'
        }, { quoted: msg });
      }

      // ✅ تحميل الصورة
      const buffer = await downloadMediaMessage(
        { message: { imageMessage } },
        'buffer',
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      );

      // ✅ حفظ مؤقت للصورة
      const tempPath = path.join(__dirname, '../temp_profile.jpg');
      fs.writeFileSync(tempPath, buffer);

      // ✅ تحديث صورة المجموعة
      await sock.updateProfilePicture(chatId, {
        url: tempPath
      });

      fs.unlinkSync(tempPath); // حذف الصورة بعد الاستخدام

      await sock.sendMessage(chatId, {
        text: '✅ تم تغيير صورة المجموعة بنجاح.'
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ حدث خطأ أثناء تغيير صورة الجروب:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تغيير صورة المجموعة:\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};