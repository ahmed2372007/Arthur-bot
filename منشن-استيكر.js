const fs = require('fs');
const path = require('path');
const { eliteNumbers, extractPureNumber } = require('../haykala/elite');

const stickerFolder = './stickers/';

module.exports = {
  command: 'ملل',
  category: 'أوامر المجموعة',
  description: 'إرسال منشن جماعي بملصق عشوائي من مجلد stickers/ (للنخبة والمشرفين فقط)',

  async execute(sock, msg, args = []) {
    try {
      const groupJid = msg.key.remoteJid;
      const senderJid = msg.key.participant || msg.participant || groupJid;

      if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, {
          text: '🚫 هذا الأمر يعمل داخل المجموعات فقط.',
        }, { quoted: msg });
      }

      const senderNumber = extractPureNumber(senderJid);

      const metadata = await sock.groupMetadata(groupJid);
      const participants = metadata.participants;
      const admins = participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => extractPureNumber(p.id));

      if (!eliteNumbers.includes(senderNumber) && !admins.includes(senderNumber)) {
        return sock.sendMessage(groupJid, {
          text: '❌ هذا الأمر مخصص فقط للنخبة أو المشرفين.',
        }, { quoted: msg });
      }

      const memberIds = participants.map(p => p.id);

      try {
        await fs.promises.access(stickerFolder);
      } catch {
        return sock.sendMessage(groupJid, {
          text: '⚠️ مجلد الملصقات غير موجود.',
        }, { quoted: msg });
      }

      const stickerFiles = (await fs.promises.readdir(stickerFolder)).filter(file => file.endsWith('.webp'));
      if (stickerFiles.length === 0) {
        return sock.sendMessage(groupJid, {
          text: '⚠️ لا توجد ملصقات في المجلد.',
        }, { quoted: msg });
      }

      const randomSticker = stickerFiles[Math.floor(Math.random() * stickerFiles.length)];
      const stickerPath = path.join(stickerFolder, randomSticker);
      const stickerBuffer = await fs.promises.readFile(stickerPath);

      try {
        await sock.sendMessage(groupJid, {
          sticker: stickerBuffer,
          mentions: memberIds,
        }, { quoted: msg });
      } catch {
        await sock.sendMessage(groupJid, {
          image: stickerBuffer,
          mentions: memberIds,
        }, { quoted: msg });
      }

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ حدث خطأ أثناء التنفيذ:\n${err.message || err.toString()}`,
      }, { quoted: msg });
    }
  }
};